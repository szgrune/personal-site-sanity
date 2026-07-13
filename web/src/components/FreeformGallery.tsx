"use client";

// FreeformGallery – three media items with parallax scroll, drag, throw, and collision
// Ported verbatim from the original site's FreeformGallery.js

import React, { useState, useRef, useEffect, useCallback } from "react";

const FRICTION = 0.98;
const BOUNCE = 0.6;
const WALL_BOUNCE = 0.5;

type Item = {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
};

type Bounds = { width: number; height: number };

function isDesktop() {
  return typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches;
}

function clampItem(item: Item, bounds: Bounds): Item {
  const { width: bw, height: bh } = bounds;
  let { x, y, vx, vy } = item;
  const { width, height } = item;
  if (bw <= 0 || bh <= 0) return { ...item, vx: 0, vy: 0 };
  const xMin = 0;
  const xMax = Math.max(xMin, bw - width);
  const yMin = 0;
  const yMax = Math.max(yMin, bh - height);
  if (x < xMin) {
    x = xMin;
    vx = -vx * WALL_BOUNCE;
  } else if (x > xMax) {
    x = xMax;
    vx = -vx * WALL_BOUNCE;
  }
  if (y < yMin) {
    y = yMin;
    vy = -vy * WALL_BOUNCE;
  } else if (y > yMax) {
    y = yMax;
    vy = -vy * WALL_BOUNCE;
  }
  return { ...item, x, y, vx, vy };
}

function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollY;
}

function useContainerRect(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [rect, setRect] = useState<{ width: number; height: number; top?: number }>({
    width: 800,
    height: 900,
  });
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const el = containerRef.current;
        const r = el.getBoundingClientRect();
        setRect({
          width: el.clientWidth,
          height: el.clientHeight,
          top: r.top,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [containerRef]);
  return rect;
}

const DEFAULT_ASPECT = 16 / 9;
const MOBILE_BREAKPOINT = 768;
const MOBILE_GAP = 24;
const MOBILE_MAX_WIDTH_FRACTION = 0.95;

type AspectRatios = (number | null)[];

function getInitialLayout(containerWidth: number, heights: number[], aspectRatios: AspectRatios): Item[] {
  const w = containerWidth || 800;
  const ar0 = aspectRatios[0] ?? DEFAULT_ASPECT;
  const ar1 = aspectRatios[1] ?? DEFAULT_ASPECT;
  const ar2 = aspectRatios[2] ?? DEFAULT_ASPECT;
  const h0 = heights[0];
  const h1 = heights[1];
  const h2 = heights[2];
  return [
    { x: w * 0.26, y: 88, width: h0 * ar0, height: h0, vx: 0, vy: 0 },
    { x: w * 1.48, y: 72, width: h1 * ar1, height: h1, vx: 0, vy: 0 },
    { x: w * 1.01, y: h1 + 48, width: h2 * ar2, height: h2, vx: 0, vy: 0 },
  ];
}

function getInitialLayoutMobile(
  containerWidth: number,
  heights: number[],
  aspectRatios: AspectRatios,
): Item[] {
  const w = containerWidth || 800;
  const maxWidth = w * MOBILE_MAX_WIDTH_FRACTION;
  const ar0 = aspectRatios[0] ?? DEFAULT_ASPECT;
  const ar1 = aspectRatios[1] ?? DEFAULT_ASPECT;
  const ar2 = aspectRatios[2] ?? DEFAULT_ASPECT;
  const h0 = heights[0];
  const h1 = heights[1];
  const h2 = heights[2];
  let w0 = h0 * ar0;
  let w1 = h1 * ar1;
  let w2 = h2 * ar2;
  const largestWidth = Math.max(w0, w1, w2);
  const scale = largestWidth > maxWidth ? maxWidth / largestWidth : 1;
  w0 *= scale;
  w1 *= scale;
  w2 *= scale;
  const s0 = h0 * scale;
  const s1 = h1 * scale;
  const s2 = h2 * scale;
  let y = MOBILE_GAP;
  return [
    { x: (w - w0) / 2, y, width: w0, height: s0, vx: 0, vy: 0 },
    { x: (w - w1) / 2, y: (y += s0 + MOBILE_GAP), width: w1, height: s1, vx: 0, vy: 0 },
    { x: (w - w2) / 2, y: (y += s1 + MOBILE_GAP), width: w2, height: s2, vx: 0, vy: 0 },
  ];
}

function detectCollision(a: Item, b: Item) {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  if (a.x >= bx2 || b.x >= ax2 || a.y >= by2 || b.y >= ay2) return null;
  const overlapLeft = ax2 - b.x;
  const overlapRight = bx2 - a.x;
  const overlapTop = ay2 - b.y;
  const overlapBottom = by2 - a.y;
  const minX = Math.min(overlapLeft, overlapRight);
  const minY = Math.min(overlapTop, overlapBottom);
  let dx = 0,
    dy = 0;
  if (minX < minY) dx = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
  else dy = overlapTop < overlapBottom ? -overlapTop : overlapBottom;
  return { dx, dy, nx: dx ? Math.sign(dx) : 0, ny: dy ? Math.sign(dy) : 0 };
}

const DEFAULT_HEIGHTS = [500, 360, 240];

export default function FreeformGallery({
  videoSrc,
  gifSrc,
  imageSrc,
  heights: heightsProp,
}: {
  videoSrc?: string | null;
  gifSrc?: string | null;
  imageSrc?: string | null;
  heights?: number[];
}) {
  const heights = heightsProp ?? DEFAULT_HEIGHTS;
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useScrollY();
  const { width: cw, height: ch } = useContainerRect(containerRef);
  const boundsRef = useRef<Bounds>({ width: cw, height: ch });
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    setDesktop(isDesktop());
  }, []);

  const isMobile = cw > 0 && cw < MOBILE_BREAKPOINT;
  const [aspectRatios, setAspectRatios] = useState<AspectRatios>([null, null, null]);
  const [items, setItems] = useState<Item[]>(() =>
    getInitialLayout(typeof window !== "undefined" ? window.innerWidth : 800, heights, [
      null,
      null,
      null,
    ]),
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastTime = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const rafRef = useRef<number | null>(null);
  const hasInitialLayout = useRef(false);
  const prevIsMobileRef = useRef<boolean | null>(null);

  boundsRef.current = { width: cw, height: ch };

  const setAspectRatio = useCallback((index: number, ratio: number) => {
    setAspectRatios((prev) => {
      const next = [...prev];
      next[index] = ratio;
      return next;
    });
  }, []);

  useEffect(() => {
    if (cw <= 0) return;
    const layout = isMobile
      ? getInitialLayoutMobile(cw, heights, aspectRatios)
      : getInitialLayout(cw, heights, aspectRatios);
    if (!hasInitialLayout.current || prevIsMobileRef.current !== isMobile) {
      hasInitialLayout.current = true;
      prevIsMobileRef.current = isMobile;
      setItems(layout);
    }
  }, [cw, heights, isMobile, aspectRatios]);

  useEffect(() => {
    if (isMobile) {
      setItems(getInitialLayoutMobile(cw, heights, aspectRatios));
    } else {
      setItems((prev) =>
        prev.map((item, i) => ({
          ...item,
          width: heights[i] * (aspectRatios[i] ?? DEFAULT_ASPECT),
          height: heights[i],
        })),
      );
    }
  }, [aspectRatios, heights, isMobile, cw]);

  const updatePosition = useCallback((index: number, dx: number, dy: number) => {
    const bounds = boundsRef.current;
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, x: item.x + dx, y: item.y + dy, vx: dx * 0.3, vy: dy * 0.3 };
        return clampItem(updated, bounds);
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!desktop) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIndex === null) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      updatePosition(draggingIndex, dx, dy);
    };
    const handleMouseUp = () => setDraggingIndex(null);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingIndex, updatePosition, desktop]);

  useEffect(() => {
    if (!desktop) return;
    const step = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime.current) / 1000, 0.1);
      lastTime.current = now;
      const bounds = boundsRef.current;
      setItems((prev) => {
        let next = prev.map((item) => {
          const moved = {
            ...item,
            x: item.x + item.vx * dt * 60,
            y: item.y + item.vy * dt * 60,
            vx: item.vx * FRICTION,
            vy: item.vy * FRICTION,
          };
          return clampItem(moved, bounds);
        });
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i];
            const b = next[j];
            const col = detectCollision(a, b);
            if (col) {
              const { dx, dy, nx, ny } = col;
              const half = 0.5;
              next = next.map((item, idx) => {
                if (idx === i)
                  return {
                    ...item,
                    x: item.x + dx * half,
                    y: item.y + dy * half,
                    vx: item.vx + nx * (1 + BOUNCE) * 0.5,
                    vy: item.vy + ny * (1 + BOUNCE) * 0.5,
                  };
                if (idx === j)
                  return {
                    ...item,
                    x: item.x - dx * half,
                    y: item.y - dy * half,
                    vx: item.vx - nx * (1 + BOUNCE) * 0.5,
                    vy: item.vy - ny * (1 + BOUNCE) * 0.5,
                  };
                return item;
              });
            }
          }
        }
        next = next.map((item) => clampItem(item, bounds));
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [desktop]);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (!desktop) return;
    e.preventDefault();
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setDraggingIndex(index);
  };

  const parallax = (index: number) => {
    const factors = [-0.06, 0.04, 0.1];
    const ty = scrollY * (factors[index] ?? 0);
    const tx = scrollY * 0.02 * (index - 1);
    return { transform: `translate(${tx}px, ${ty}px)` };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "90vh",
        marginBottom: "0vh",
        padding: "0 4vw",
        boxSizing: "border-box",
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          role={index === 0 ? "presentation" : "img"}
          aria-hidden="true"
          onMouseDown={(e) => handleMouseDown(e, index)}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            cursor: desktop ? "grab" : "default",
            ...(draggingIndex === index && { cursor: "grabbing" }),
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            touchAction: "none",
            userSelect: "none",
            pointerEvents: "auto",
            ...parallax(index),
          }}
        >
          {index === 0 && videoSrc && (
            <video
              src={videoSrc}
              onLoadedMetadata={(e) => {
                const v = e.target as HTMLVideoElement;
                if (v.videoWidth && v.videoHeight) setAspectRatio(0, v.videoWidth / v.videoHeight);
              }}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          )}
          {index === 1 && gifSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gifSrc}
              alt=""
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.naturalWidth && img.naturalHeight)
                  setAspectRatio(1, img.naturalWidth / img.naturalHeight);
              }}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          )}
          {index === 2 && imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt=""
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.naturalWidth && img.naturalHeight)
                  setAspectRatio(2, img.naturalWidth / img.naturalHeight);
              }}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
