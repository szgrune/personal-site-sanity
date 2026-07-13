"use client";

// Work page project card grid, ported from the original Work.js.
// Card content now comes from Sanity `project` documents.

import React, { useState, useRef, useEffect, useMemo } from "react";
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

function HoverGifImage({
  gifSrc,
  alt,
  isHovering,
}: {
  gifSrc: string;
  alt: string;
  isHovering: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const staticFrameRef = useRef<string | null>(null);

  useEffect(() => {
    if (imgRef.current) {
      if (isHovering) {
        // Show animated GIF and restart animation on hover
        imgRef.current.src = `${gifSrc}?t=${Date.now()}`;
      } else {
        // When not hovering, show static first frame if available
        if (staticFrameRef.current) {
          imgRef.current.src = staticFrameRef.current;
        } else {
          // Extract first frame on first load
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL("image/png");
              staticFrameRef.current = dataUrl;
              if (imgRef.current && !isHovering) {
                imgRef.current.src = dataUrl;
              }
            } catch {
              // If extraction fails, just use the GIF
              staticFrameRef.current = gifSrc;
            }
          };
          img.src = gifSrc;
        }
      }
    }
  }, [isHovering, gifSrc]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={gifSrc}
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
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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

/**
 * Grid item that fades/scales in and out when its card is filtered, and is
 * removed from the layout once the exit animation finishes.
 */
function AnimatedGridItem({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(visible);
  const [shown, setShown] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Two frames so the element paints in its hidden state before animating in
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timeout = setTimeout(() => setMounted(false), 320);
    return () => clearTimeout(timeout);
  }, [visible]);

  if (!mounted) return null;

  return (
    <Grid
      item
      xs={2}
      sm={4}
      md={4}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "scale(1)" : "scale(0.9)",
        transition: "opacity 300ms ease, transform 300ms ease",
      }}
    >
      {children}
    </Grid>
  );
}

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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const isVisible = (project: ProjectCard) =>
    selectedTags.length === 0 ||
    (project.tags ?? []).some((tag) => selectedTags.includes(tag));

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
          {projects.map((project) => (
            <AnimatedGridItem key={project._id} visible={isVisible(project)}>
              {project.comingSoon || !project.slug ? (
                <ComingSoonCard project={project} />
              ) : (
                <LinkedCard project={project} />
              )}
            </AnimatedGridItem>
          ))}
        </Grid>
      </div>
    </div>
  );
}
