import { ChevronDown } from "lucide-react";
import { useState } from "react";

/** Small expandable legend, bottom-left on the map. */
export function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    // Mobile: sit above the bottom action bar; desktop: bottom-left corner.
    <div className="absolute bottom-20 left-3 z-20 max-w-[220px] rounded-md border border-roman-stone/25 bg-roman-paper/95 text-xs shadow-sm lg:bottom-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2 font-medium text-roman-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red lg:min-h-0"
      >
        Legenda
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="space-y-2 border-t border-roman-stone/15 px-3 py-2 text-roman-charcoal">
          <li
            className="flex items-center gap-2 motion-safe:animate-[limes-item-in_180ms_ease-out_both]"
            style={{ animationDelay: "0ms" }}
          >
            <span
              className="inline-block h-3.5 w-3.5 rounded-full border-2 border-roman-bronze bg-roman-red"
              aria-hidden
            />
            muntvindplaats
          </li>
          <li
            className="flex items-center gap-2 motion-safe:animate-[limes-item-in_180ms_ease-out_both]"
            style={{ animationDelay: "60ms" }}
          >
            <span
              className="inline-block h-3.5 w-3.5 rounded-full border-2 border-roman-gold bg-transparent"
              aria-hidden
            />
            geselecteerde vindplaats
          </li>
          <li
            className="flex items-center gap-2 motion-safe:animate-[limes-item-in_180ms_ease-out_both]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm bg-roman-parchment px-0.5 text-[10px] font-semibold text-roman-charcoal" aria-hidden>
              12
            </span>
            meerdere vondsten / cluster
          </li>
          <li
            className="flex items-center gap-2 motion-safe:animate-[limes-item-in_180ms_ease-out_both]"
            style={{ animationDelay: "180ms" }}
          >
            <img
              src={`${import.meta.env.BASE_URL}fort.png`}
              alt=""
              className="h-4 w-auto"
              aria-hidden
            />
            Romeins fort of nederzetting (klik voor info)
          </li>
          <li
            className="flex items-center gap-2 motion-safe:animate-[limes-item-in_180ms_ease-out_both]"
            style={{ animationDelay: "210ms" }}
          >
            <img
              src={`${import.meta.env.BASE_URL}farm-icon.png`}
              alt=""
              className="h-4 w-auto"
              aria-hidden
            />
            vicus / boerderij (klik voor info)
          </li>
          <li
            className="flex items-center gap-2 motion-safe:animate-[limes-item-in_180ms_ease-out_both]"
            style={{ animationDelay: "240ms" }}
          >
            <span
              className="inline-block h-2 w-2 rotate-45 rounded-[2px] border border-roman-paper bg-[#8C7A5B]"
              aria-hidden
            />
            villa, tempel of ander gebouw (zoom in)
          </li>
        </ul>
      )}
    </div>
  );
}
