import { useRef } from "react";

interface DateRangeFilterProps {
  min: number;
  max: number;
  from?: number;
  to?: number;
  onChange: (from?: number, to?: number) => void;
}

/**
 * Dual-range timeline over the parsed dataset extent (derived, never
 * hardcoded). A record matches when its dating range intersects the filter.
 *
 * Pointer events (not just onChange) decide when a drag starts/ends, so a
 * thumb that is released off-screen — or when the pointer leaves the input
 * mid-drag — still finishes cleanly instead of getting stuck.
 */
export function DateRangeFilter({ min, max, from, to, onChange }: DateRangeFilterProps) {
  const lo = from ?? min;
  const hi = to ?? max;
  // Which thumb is being dragged right now ("lo" | "hi" | null). Pointer
  // capture on the input means pointerup fires even if the cursor is far
  // outside the element by the time the user lets go.
  const dragging = useRef<"lo" | "hi" | null>(null);

  const endDrag = () => {
    dragging.current = null;
  };

  const changeLo = (raw: number, e: React.PointerEvent<HTMLInputElement>) => {
    // Ignore stray move/change events once the drag has ended elsewhere.
    if (dragging.current === null) return;
    const v = Math.min(raw, hi);
    onChange(v === min && hi === max ? undefined : v, to);
    // Keep the pointer captured until release so the drag tracks smoothly.
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const changeHi = (raw: number, e: React.PointerEvent<HTMLInputElement>) => {
    if (dragging.current === null) return;
    const v = Math.max(raw, lo);
    onChange(from, v === max && (from ?? min) === min ? undefined : v);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    // min-w-0 keeps the dual slider from forcing the fieldset wider than the
    // mobile filter panel.
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-roman-stone">
        Datering
      </legend>
      <div className="mb-1 flex justify-between text-xs text-roman-charcoal">
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
      <div className="space-y-2">
        {/* block + min-w-0 keep the range track inside the panel on narrow
            screens (iOS/Firefox would otherwise overflow the overlay edge) */}
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          aria-label={`Datering vanaf (${lo})`}
          onPointerDown={(e) => {
            dragging.current = "lo";
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onChange={(e) => changeLo(Number(e.target.value), e as unknown as React.PointerEvent<HTMLInputElement>)}
          className="block h-7 w-full min-w-0 cursor-pointer touch-none accent-roman-red"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          aria-label={`Datering tot en met (${hi})`}
          onPointerDown={(e) => {
            dragging.current = "hi";
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onChange={(e) => changeHi(Number(e.target.value), e as unknown as React.PointerEvent<HTMLInputElement>)}
          className="block h-7 w-full min-w-0 cursor-pointer touch-none accent-roman-red"
        />
      </div>
      <p className="mt-1 text-xs text-roman-stone">
        {min}–{max} n.Chr.
      </p>
    </fieldset>
  );
}
