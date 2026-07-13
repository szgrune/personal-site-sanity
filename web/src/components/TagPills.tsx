"use client";

// Rectangular (0px radius) filter pills for the work page, solid-filled in a
// CMYK print palette with black text. Each tag gets a random color on every
// page load. The K slot is rendered as paper-white so black text stays legible.

import React, { useEffect, useState } from "react";

const CMYK = [
  "#00AEEF", // cyan
  "#EC008C", // magenta
  "#FFF200", // yellow
  "#FFFFFF", // key slot, inverted to paper white for black text
];

function shuffled<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function TagPills({
  tags,
  selected,
  onToggle,
}: {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}) {
  const [colors, setColors] = useState<Record<string, string> | null>(null);

  // Assign random CMYK colors after mount (avoids SSR/client mismatch and
  // re-rolls on every page load). Cycle through shuffled palettes so colors
  // stay varied even with many tags.
  useEffect(() => {
    const assigned: Record<string, string> = {};
    let pool: string[] = [];
    for (const tag of tags) {
      if (pool.length === 0) pool = shuffled(CMYK);
      assigned[tag] = pool.pop() as string;
    }
    setColors(assigned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags.join("|")]);

  if (!colors || tags.length === 0) return null;

  return (
    <div className="tag-pills">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={`tag-pill${isSelected ? " selected" : ""}`}
            style={{ "--pill-color": colors[tag] ?? CMYK[0] } as React.CSSProperties}
            aria-pressed={isSelected}
            onClick={() => onToggle(tag)}
          >
            {tag}
            <span className="pill-x" aria-hidden="true">
              ✕
            </span>
          </button>
        );
      })}
    </div>
  );
}
