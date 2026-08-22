"use client";

// Hosts the MassDOT shelf app — a static Next export living in
// public/massdot-shelf/ — inside the site chrome. Browsing shelves and slide
// decks happens entirely within the frame, so the site header stays put and
// the address bar never leaves /massdot.

import { useCallback, useEffect, useRef, useState } from "react";

const SHELF_SRC = "/massdot-shelf";
const THEME_MESSAGE = "massdot-shelf:theme";
const READY_MESSAGE = "massdot-shelf:ready";

// Floor for very short viewports, so the shelf never collapses to a sliver.
const MIN_HEIGHT = 420;
const FALLBACK_HEIGHT = "80vh";

export default function ShelfEmbed() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  // Claim whatever is left of the viewport below the header. The frame's own
  // top is the honest measurement — it picks up the header's bottom margin,
  // which its bounding box leaves out — and setting a height can't move it,
  // so this can't feed back into itself. The header is observed separately
  // because it reflows (and changes height) on narrow viewports.
  useEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const top = frame.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(MIN_HEIGHT, window.innerHeight - top));
    };

    const header = document.querySelector(".header");

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  // The site's light/dark toggle lives out here, so push the current theme in.
  const postTheme = useCallback(() => {
    const theme =
      document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    frameRef.current?.contentWindow?.postMessage(
      { type: THEME_MESSAGE, theme },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    // The shelf pings on every load — including its own internal navigations,
    // which reset the frame's document — and we answer with the current theme.
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if ((event.data as { type?: string } | null)?.type !== READY_MESSAGE) return;
      postTheme();
    };
    window.addEventListener("message", onMessage);

    const observer = new MutationObserver(postTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("message", onMessage);
      observer.disconnect();
    };
  }, [postTheme]);

  return (
    <iframe
      ref={frameRef}
      className="shelf-embed"
      src={SHELF_SRC}
      title="The Lab @ MassDOT Fellowship"
      style={{ height: height ?? FALLBACK_HEIGHT }}
      onLoad={postTheme}
    />
  );
}
