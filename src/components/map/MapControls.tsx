import { Maximize2, Route } from "lucide-react";
import { useCallback, useState } from "react";
import { IconButton } from "../ui/IconButton";

/**
 * Desktop corner controls: fit-to-data and the Roman-roads overlay toggle.
 * Hidden below `lg` — the MobileActionBar covers these actions within thumb
 * reach there. Fullscreen was removed: it added a third floating control for
 * little value, and the detail panel already handles focus.
 */
export function MapControls({ indented = false }: { indented?: boolean }) {
  const [roadsVisible, setRoadsVisible] = useState(true);

  const fitData = useCallback(() => {
    window.dispatchEvent(new Event("limes:fit-data"));
  }, []);

  const toggleRoads = useCallback(() => {
    setRoadsVisible((v) => {
      window.dispatchEvent(new CustomEvent("limes:toggle-roads", { detail: !v }));
      return !v;
    });
  }, []);

  return (
    // Desktop only: the mobile/tablet actions live in the bottom action bar.
    // `indented` drops the stack below the floating Filters trigger that
    // appears when the sidebar is collapsed.
    <div
      className={`absolute left-3 z-20 hidden flex-col gap-2 lg:flex ${
        indented ? "top-16" : "top-3"
      }`}
    >
      <IconButton
        variant="surface"
        size="map"
        label="Zoom naar alle vindplaatsen"
        title="Zoom naar alle vindplaatsen"
        onClick={fitData}
      >
        <Maximize2 className="h-4 w-4" aria-hidden />
      </IconButton>
      <IconButton
        variant="surface"
        size="map"
        active={roadsVisible}
        label={roadsVisible ? "Verberg Romeinse wegen" : "Toon Romeinse wegen"}
        title={roadsVisible ? "Verberg Romeinse wegen" : "Toon Romeinse wegen"}
        aria-pressed={roadsVisible}
        onClick={toggleRoads}
      >
        <Route className="h-4 w-4" aria-hidden />
      </IconButton>
    </div>
  );
}
