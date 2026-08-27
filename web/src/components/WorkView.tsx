"use client";

// Work page shell: the tagline, the tag filter, the VIEW switcher, and both
// project views. Both views stay mounted — switching only flips which pane is
// shown, so LIST↔GRID is instant, needs no navigation, and never re-fetches.
//
// `view` starts as null, meaning "nobody has chosen yet, follow the
// breakpoint" — list on desktop, grid on mobile. That default has to be
// resolved in CSS rather than here: /work is prerendered once and served to
// every viewport, so picking it in JS would paint the desktop default and then
// swap it out on phones. Clicking either option sets `view` and pins it.

import React, { useMemo, useRef, useState } from "react";
import { Typography } from "@mui/material";

import TagPills from "./TagPills";
import WorkGrid, { type ProjectCard, type WorkGridHandle } from "./WorkGrid";
import WorkList from "./WorkList";

type View = "list" | "grid";

const VIEWS: { id: View; label: string }[] = [
  { id: "list", label: "List" },
  { id: "grid", label: "Grid" },
];

export default function WorkView({
  tagline,
  categories,
  projects,
}: {
  tagline?: string | null;
  categories?: string[] | null;
  projects: ProjectCard[];
}) {
  const [view, setView] = useState<View | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const gridRef = useRef<WorkGridHandle>(null);

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

  const visibleProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          selectedTags.length === 0 ||
          (project.tags ?? []).some((tag) => selectedTags.includes(tag)),
      ),
    [projects, selectedTags],
  );

  const toggleTag = (tag: string) => {
    const nextSelected = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    // The grid animates its reflow with FLIP, which has to measure the old
    // card positions before the new selection renders.
    gridRef.current?.prepareFilterChange(nextSelected);
    setSelectedTags(nextSelected);
  };

  return (
    <div className={`work-view work-view--${view ?? "auto"}`}>
      <Typography variant="h5" component="h5" sx={{ textAlign: "center", marginBottom: "5vh" }}>
        {(tagline || "").split("\n").map((line, i, arr) => (
          <React.Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </Typography>

      <TagPills tags={allTags} selected={selectedTags} onToggle={toggleTag} />

      <div className="view-switch" role="group" aria-label="Project view">
        <span className="view-switch-label">View:</span>
        {VIEWS.map(({ id, label }, i) => (
          <React.Fragment key={id}>
            {i > 0 && <span className="view-switch-rule" aria-hidden="true" />}
            <button
              type="button"
              // Read by the .work-view--auto rules, which mark whichever option
              // the breakpoint is showing until an explicit choice is made.
              data-view={id}
              className={`view-switch-option${view === id ? " active" : ""}`}
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="work-view-pane work-view-pane--list">
        <WorkList projects={visibleProjects} />
      </div>
      <div className="work-view-pane work-view-pane--grid">
        <WorkGrid ref={gridRef} projects={projects} />
      </div>
    </div>
  );
}
