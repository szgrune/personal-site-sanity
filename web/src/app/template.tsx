// Fades each route in over 300ms, replacing the original
// react-transition-group CSSTransition behavior.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
