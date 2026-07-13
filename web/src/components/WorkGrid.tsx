"use client";

// Work page project card grid, ported from the original Work.js.
// Card content now comes from Sanity `project` documents.

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import Grid from "@mui/material/Grid";
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import TagPills from "./TagPills";

export type ProjectCard = {
  _id: string;
  title: string;
  slug?: string | null;
  tags?: string[] | null;
  cardSubtitle?: string | null;
  cardDescription?: string | null;
  cardMediaType?: "image" | "animatedGif" | "video" | null;
  cardImageFit?: "cover" | "contain" | null;
  comingSoon?: boolean | null;
  cardImageUrl?: string | null;
  cardVideoUrl?: string | null;
};

function HoverVideo({ videoSrc, isHovering }: { videoSrc: string; isHovering: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const frameExtracted = useRef(false);

  // Check if device is mobile/touch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Extract first frame as poster
  useEffect(() => {
    if (videoRef.current && !frameExtracted.current) {
      const video = videoRef.current;

      const extractFrame = () => {
        try {
          video.currentTime = 0.1;
        } catch {
          // If seeking fails, try without seeking
        }
      };

      const captureFrame = () => {
        if (frameExtracted.current) return;
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 800;
          canvas.height = video.videoHeight || 600;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          setPosterUrl(dataUrl);
          frameExtracted.current = true;
        } catch {
          // If extraction fails, video will use its default poster behavior
        }
      };

      video.addEventListener("loadedmetadata", extractFrame);
      video.addEventListener("seeked", captureFrame);
      video.addEventListener("loadeddata", captureFrame);

      return () => {
        video.removeEventListener("loadedmetadata", extractFrame);
        video.removeEventListener("seeked", captureFrame);
        video.removeEventListener("loadeddata", captureFrame);
      };
    }
  }, []);

  // Control video playback
  useEffect(() => {
    if (videoRef.current && !isMobile) {
      if (isHovering) {
        videoRef.current.play().catch(() => {
          // Video play failed, likely autoplay restrictions
        });
      } else {
        videoRef.current.pause();
        if (videoRef.current.readyState >= 2) {
          videoRef.current.currentTime = 0; // Reset to first frame
        }
      }
    } else if (videoRef.current && isMobile) {
      // On mobile, always pause and show first frame
      videoRef.current.pause();
      if (videoRef.current.readyState >= 2) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovering, isMobile]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      poster={posterUrl || undefined}
      style={{
        width: "100%",
        height: 200,
        objectFit: "cover",
        display: "block",
        borderRadius: 0,
      }}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

// Appends a Sanity image-pipeline param to a CDN asset URL, respecting an
// existing query string if the source URL already has one.
function withImageParam(url: string, param: string) {
  return `${url}${url.includes("?") ? "&" : "?"}${param}`;
}

function HoverGifImage({
  gifSrc,
  alt,
  isHovering,
}: {
  gifSrc: string;
  alt: string;
  isHovering: boolean;
}) {
  // Sanity's CDN rasterizes a static frame from an animated GIF when a
  // non-gif format is requested, so the poster is a real static asset —
  // never the animated file — with no client-side extraction/race involved.
  const staticSrc = withImageParam(gifSrc, "fm=png");
  const [src, setSrc] = useState(staticSrc);

  useEffect(() => {
    if (isHovering) {
      // Cache-bust so the animation restarts from frame one on every hover
      setSrc(withImageParam(gifSrc, `t=${Date.now()}`));
    } else {
      setSrc(staticSrc);
    }
  }, [isHovering, gifSrc, staticSrc]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: 200,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

function CardText({ project }: { project: ProjectCard }) {
  return (
    <Box sx={{ padding: "16px 24px 24px 24px" }}>
      <Typography variant="h4" component="div">
        {project.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {project.cardSubtitle}
      </Typography>
      <Typography variant="body1">{project.cardDescription}</Typography>
    </Box>
  );
}

function CardMediaBlock({
  project,
  isHovering,
}: {
  project: ProjectCard;
  isHovering: boolean;
}) {
  if (project.cardMediaType === "video" && project.cardVideoUrl) {
    return (
      <div style={{ height: 200, borderRadius: 0, overflow: "hidden" }}>
        <HoverVideo videoSrc={project.cardVideoUrl} isHovering={isHovering} />
      </div>
    );
  }
  if (project.cardMediaType === "animatedGif" && project.cardImageUrl) {
    return (
      <div style={{ height: 200, borderRadius: 0, overflow: "hidden" }}>
        <HoverGifImage gifSrc={project.cardImageUrl} alt={project.title} isHovering={isHovering} />
      </div>
    );
  }
  if (project.cardImageFit === "contain") {
    return (
      <CardMedia
        sx={{ objectFit: "contain", height: 200, borderRadius: 0, backgroundColor: "black", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}
        image={project.cardImageUrl || undefined}
      />
    );
  }
  return <CardMedia sx={{ height: 200, borderRadius: 0 }} image={project.cardImageUrl || undefined} />;
}

function ComingSoonCard({ project }: { project: ProjectCard }) {
  const [hover, setHover] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: 0,
        position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <CardContent sx={{ padding: 0 }}>
        <CardMediaBlock project={project} isHovering={hover} />
        <CardText project={project} />
        {hover && (
          <Typography
            variant="body1"
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              backgroundColor: (theme) => theme.palette.background.default,
              padding: "8px 12px",
              borderRadius: 0,
              border: (theme) => `1px solid ${theme.palette.text.primary}`,
            }}
          >
            Coming soon
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function LinkedCard({ project }: { project: ProjectCard }) {
  const [hover, setHover] = useState(false);
  const router = useRouter();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const redirectRoute = async (routePath: string) => {
    await delay(300);
    router.push(routePath);
  };

  return (
    <CardActionArea
      sx={{ borderRadius: 0 }}
      onClick={() => redirectRoute(`/${project.slug}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Card sx={{ borderRadius: 0 }}>
        <CardContent sx={{ padding: 0 }}>
          <CardMediaBlock project={project} isHovering={hover} />
          <CardText project={project} />
        </CardContent>
      </Card>
    </CardActionArea>
  );
}

const EXIT_MS = 300;

export default function WorkGrid({
  tagline,
  categories,
  projects,
}: {
  tagline?: string | null;
  categories?: string[] | null;
  projects: ProjectCard[];
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Pills: only tags that at least one project actually has, ordered by the
  // CMS base-category list first, then any extra tags in project order — so
  // entering a brand new tag on a project creates a new pill.
  const allTags = useMemo(() => {
    const usedTags = new Set<string>();
    for (const project of projects) {
      for (const tag of project.tags ?? []) {
        usedTags.add(tag);
      }
    }
    const ordered = (categories ?? []).filter((tag) => usedTags.has(tag));
    for (const project of projects) {
      for (const tag of project.tags ?? []) {
        if (!ordered.includes(tag)) ordered.push(tag);
      }
    }
    return ordered;
  }, [categories, projects]);

  // --- Filtering with FLIP layout animation -------------------------------
  // Exiting cards fade/scale out in place (EXIT_MS), then leave the layout;
  // at that moment the surviving cards are translated from their old grid
  // positions to their new ones so the reflow reads as smooth movement.

  const allIds = useMemo(() => projects.map((p) => p._id), [projects]);
  const [renderedIds, setRenderedIds] = useState<Set<string>>(() => new Set(allIds));
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());
  const [enteringIds, setEnteringIds] = useState<Set<string>>(() => new Set());
  const itemEls = useRef(new Map<string, HTMLElement>());
  const firstPositions = useRef<Map<string, { left: number; top: number }> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeVisibleIds = (selected: string[]) =>
    new Set(
      projects
        .filter(
          (project) =>
            selected.length === 0 ||
            (project.tags ?? []).some((tag) => selected.includes(tag)),
        )
        .map((project) => project._id),
    );

  // Capture current layout positions of the cards still in the DOM ("First"
  // in FLIP). offsetLeft/Top are layout-relative, so scrolling can't skew them.
  const capturePositions = () => {
    const positions = new Map<string, { left: number; top: number }>();
    itemEls.current.forEach((el, id) => {
      positions.set(id, { left: el.offsetLeft, top: el.offsetTop });
    });
    firstPositions.current = positions;
  };

  const toggleTag = (tag: string) => {
    const nextSelected = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    const target = computeVisibleIds(nextSelected);

    // "First" snapshot before entering cards join the layout
    capturePositions();

    setSelectedTags(nextSelected);
    setEnteringIds(new Set([...target].filter((id) => !renderedIds.has(id) || exitingIds.has(id))));
    const nextRendered = new Set([...renderedIds, ...target]);
    setRenderedIds(nextRendered);
    setExitingIds(new Set([...nextRendered].filter((id) => !target.has(id))));

    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    exitTimer.current = setTimeout(() => {
      // "First" snapshot before the faded-out cards leave the layout
      capturePositions();
      setRenderedIds(target);
      setExitingIds(new Set());
    }, EXIT_MS);
    enterTimer.current = setTimeout(() => setEnteringIds(new Set()), EXIT_MS + 50);
  };

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (enterTimer.current) clearTimeout(enterTimer.current);
    },
    [],
  );

  // "Last" + "Invert" + "Play": after a render that changed the layout,
  // translate each surviving card from where it was to where it now is.
  useLayoutEffect(() => {
    const first = firstPositions.current;
    firstPositions.current = null;
    if (!first) return;
    itemEls.current.forEach((el, id) => {
      const prev = first.get(id);
      if (!prev) return; // newly entered card, animated via CSS instead
      const dx = prev.left - el.offsetLeft;
      const dy = prev.top - el.offsetTop;
      if (dx === 0 && dy === 0) return;
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      void el.offsetWidth; // flush so the inverted position paints
      el.style.transition = "transform 300ms ease";
      el.style.transform = "";
    });
  });

  return (
    <div>
      <Typography variant="h5" component="h5" sx={{ textAlign: "center", marginBottom: "5vh" }}>
        {(tagline || "").split("\n").map((line, i, arr) => (
          <React.Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </Typography>
      <TagPills tags={allTags} selected={selectedTags} onToggle={toggleTag} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "left" as React.CSSProperties["alignItems"],
          marginLeft: "5vw",
          marginRight: "5vw",
        }}
      >
        {/* rendering the card component with card content */}
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 8, md: 12 }}>
          {projects
            .filter((project) => renderedIds.has(project._id))
            .map((project) => (
              <Grid
                item
                xs={2}
                sm={4}
                md={4}
                key={project._id}
                ref={(el: HTMLElement | null) => {
                  if (el) itemEls.current.set(project._id, el);
                  else itemEls.current.delete(project._id);
                }}
              >
                <div
                  className={`card-anim${exitingIds.has(project._id) ? " card-exit" : ""}${
                    enteringIds.has(project._id) ? " card-enter" : ""
                  }`}
                >
                  {project.comingSoon || !project.slug ? (
                    <ComingSoonCard project={project} />
                  ) : (
                    <LinkedCard project={project} />
                  )}
                </div>
              </Grid>
            ))}
        </Grid>
      </div>
    </div>
  );
}
