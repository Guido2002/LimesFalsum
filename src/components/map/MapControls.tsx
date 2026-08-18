import { Maximize, Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/** "Fit to data" + fullscreen controls rendered as HTML over the map. */
export function MapControls() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const fitData = useCallback(() => {
    window.dispatchEvent(new Event("limes:fit-data"));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.getElementById("limes-map-shell")?.requestFullscreen();
    }
  }, []);

  return (
    <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={fitData}
        aria-label="Zoom naar alle vindplaatsen"
        title="Zoom naar alle vindplaatsen"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-roman-stone/25 bg-roman-paper/95 text-roman-charcoal shadow-sm transition-colors hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
      >
        <Maximize2 className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Volledig scherm verlaten" : "Volledig scherm"}
        title={isFullscreen ? "Volledig scherm verlaten" : "Volledig scherm"}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-roman-stone/25 bg-roman-paper/95 text-roman-charcoal shadow-sm transition-colors hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" aria-hidden />
        ) : (
          <Maximize className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
