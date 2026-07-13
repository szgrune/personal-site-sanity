"use client";

// Theme toggle: a black square in light mode that morphs into a white circle
// in dark mode (border-radius + background animate via CSS in globals.css).
export default function ThemeToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={`theme-toggle${checked ? " dark" : ""}`}
      aria-label={checked ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={checked}
      onClick={onChange}
    />
  );
}
