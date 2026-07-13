"use client";

// Rectangular (0px radius) filter pills for the work page. Monochrome scheme:
// paper fill with ink border/text (colors come from the --ink/--paper CSS
// variables so they invert with the theme).
//
// The previous CMYK random-color scheme is kept below in case we bring the
// colors back:
//
// const CMYK = [
//   "#00AEEF", // cyan
//   "#EC008C", // magenta
//   "#FFF200", // yellow
//   "#FFFFFF", // key slot, inverted to paper white for black text
// ];
//
// function shuffled<T>(arr: T[]): T[] {
//   const out = [...arr];
//   for (let i = out.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [out[i], out[j]] = [out[j], out[i]];
//   }
//   return out;
// }
//
// Inside the component, colors were assigned after mount (avoiding an
// SSR/client mismatch and re-rolling on every page load):
//
// const [colors, setColors] = useState<Record<string, string> | null>(null);
// useEffect(() => {
//   const assigned: Record<string, string> = {};
//   let pool: string[] = [];
//   for (const tag of tags) {
//     if (pool.length === 0) pool = shuffled(CMYK);
//     assigned[tag] = pool.pop() as string;
//   }
//   setColors(assigned);
// }, [tags.join("|")]);
//
// ...and applied per pill via style={{ "--pill-color": colors[tag] }}.

export default function TagPills({
  tags,
  selected,
  onToggle,
}: {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="tag-pills">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={`tag-pill${isSelected ? " selected" : ""}`}
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
