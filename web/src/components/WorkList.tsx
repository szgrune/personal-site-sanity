"use client";

// Work page list view (the default). Full-bleed rows — YEAR / TITLE /
// CATEGORIES — separated by 1px rules, with a hover preview of the project's
// card image fixed at the centre of the viewport *behind* the rules and text,
// so scrubbing down the list flips through the images. Previews swap instantly
// (no fade, no scale) and show the original asset at its natural size. Touch
// devices get the text list only. Rows are ordered newest year first,
// independently of the grid, which keeps the order set in Sanity.

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { originalImageUrl } from "@/sanity/imageUrl";
import type { ProjectCard } from "./WorkGrid";

// Sort key for the YEAR column. "2024" → 2024, "2022–24" → 2024,
// "2023–present" → 2023. A range's two-digit tail is expanded into the century
// of the year before it, so a project that ran 2022–24 sorts as recently as one
// dated 2024.
function latestYear(year?: string | null): number | null {
  if (!year) return null;
  const parts = year.match(/\d{2,4}/g);
  if (!parts) return null;
  let latest: number | null = null;
  let century = 0;
  for (const part of parts) {
    let value = Number(part);
    if (part.length === 4) {
      century = Math.floor(value / 100) * 100;
    } else if (century) {
      value += century;
    } else {
      continue; // a bare two-digit number with nothing to anchor it
    }
    if (latest === null || value > latest) latest = value;
  }
  return latest;
}

// Newest first. Projects sharing a year — and undated ones, which collect at
// the bottom — keep their Sanity ordering, since Array#sort is stable.
function byYearDescending(projects: ProjectCard[]): ProjectCard[] {
  return [...projects].sort((a, b) => {
    const yearA = latestYear(a.year);
    const yearB = latestYear(b.year);
    if (yearA === yearB) return 0;
    if (yearA === null) return 1;
    if (yearB === null) return -1;
    return yearB - yearA;
  });
}

function HoverMedia({ project, active }: { project: ProjectCard; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {
        // Autoplay refused; the first frame stays on screen
      });
    } else {
      video.pause();
      if (video.readyState >= 2) video.currentTime = 0;
    }
  }, [active]);

  const className = `work-list-image${active ? " active" : ""}`;

  if (project.cardImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={className}
        // The original asset's own dimensions, unresized and uncropped, just
        // re-encoded: the preview draws it at natural size (capped at 40vh
        // tall), so it is never upscaled and never soft.
        src={originalImageUrl(project.cardImageUrl)}
        alt=""
      />
    );
  }

  if (project.cardVideoUrl) {
    return (
      <video
        ref={videoRef}
        className={className}
        src={project.cardVideoUrl}
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  return null;
}

function RowContent({ project }: { project: ProjectCard }) {
  return (
    <>
      <span className="wl-year">{project.year || "—"}</span>
      <span className="wl-title">
        {project.title}
        {project.comingSoon && <span className="wl-soon">Coming soon</span>}
      </span>
      <span className="wl-cats">{(project.tags ?? []).join(", ")}</span>
    </>
  );
}

function Row({
  project,
  onHover,
}: {
  project: ProjectCard;
  onHover: (id: string | null) => void;
}) {
  const href = project.linkType === "external" ? project.externalUrl : project.slug && `/${project.slug}`;
  const linkable = !project.comingSoon && Boolean(href);

  const handlers = {
    onMouseEnter: () => onHover(project._id),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(project._id),
    onBlur: () => onHover(null),
  };

  if (!linkable) {
    return (
      <div className="work-list-row soon" {...handlers}>
        <RowContent project={project} />
      </div>
    );
  }

  if (project.linkType === "external") {
    const newTab = project.openInNewTab !== false;
    return (
      <a
        className="work-list-row"
        href={href as string}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noreferrer" : undefined}
        {...handlers}
      >
        <RowContent project={project} />
      </a>
    );
  }

  return (
    <Link className="work-list-row" href={href as string} {...handlers}>
      <RowContent project={project} />
    </Link>
  );
}

export default function WorkList({ projects }: { projects: ProjectCard[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);

  // The list reads chronologically; the grid keeps the running order set in
  // Sanity, so the sort lives here rather than in the shared parent.
  const sorted = useMemo(() => byYearDescending(projects), [projects]);

  // Mount the preview layer only for real pointers: touch devices have nothing
  // to hover, and leaving it out keeps those images off their connection.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <div className="work-list">
      {canHover && (
        <div className="work-list-media" aria-hidden="true">
          {sorted.map((project) => (
            <HoverMedia key={project._id} project={project} active={hoveredId === project._id} />
          ))}
        </div>
      )}
      {/* Keyed on the visible set so filtering fades the rows back in */}
      <div className="work-list-rows" key={sorted.map((project) => project._id).join("|")}>
        <div className="work-list-head" aria-hidden="true">
          <span className="wl-year">Year</span>
          <span className="wl-title">Title</span>
          <span className="wl-cats">Categories</span>
        </div>
        {sorted.map((project) => (
          <Row key={project._id} project={project} onHover={setHoveredId} />
        ))}
      </div>
    </div>
  );
}
