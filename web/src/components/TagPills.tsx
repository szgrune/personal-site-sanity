"use client";

// Rectangular (0px radius) filter pills for the work page, colored in a
// CMYK print palette. Each tag gets a random color on every page load.

import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";

type PillColor = { color: string; contrast: string };

const CMYK: PillColor[] = [
  { color: "#00AEEF", contrast: "#000000" }, // cyan
  { color: "#EC008C", contrast: "#ffffff" }, // magenta
  { color: "#FFF200", contrast: "#000000" }, // yellow
  { color: "#000000", contrast: "#ffffff" }, // key
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
  const theme = useTheme();
  const [colors, setColors] = useState<Record<string, PillColor> | null>(null);

  // Assign random CMYK colors after mount (avoids SSR/client mismatch and
  // re-rolls on every page load). Cycle through shuffled palettes so colors
  // stay varied even with many tags.
  useEffect(() => {
    const assigned: Record<string, PillColor> = {};
    let pool: PillColor[] = [];
    for (const tag of tags) {
      if (pool.length === 0) pool = shuffled(CMYK);
      assigned[tag] = pool.pop() as PillColor;
    }
    setColors(assigned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags.join("|")]);

  if (!colors || tags.length === 0) return null;

  const isDark = theme.palette.mode === "dark";

  return (
    <div className="tag-pills">
      {tags.map((tag) => {
        let { color, contrast } = colors[tag] ?? CMYK[3];
        // The K (black) pill inverts with the theme so it stays visible
        if (color === "#000000" && isDark) {
          color = "#ffffff";
          contrast = "#000000";
        }
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={`tag-pill${isSelected ? " selected" : ""}`}
            style={
              {
                "--pill-color": color,
                "--pill-contrast": contrast,
              } as React.CSSProperties
            }
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
