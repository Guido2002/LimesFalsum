import { X } from "lucide-react";
import { useEffect } from "react";
import { DATASET_SUMMARY } from "../hooks/useCoinFilters";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { IconButton } from "../components/ui/IconButton";

interface AboutPageProps {
  onClose: () => void;
}

/**
 * Concise explanation of what LimesFalsum is and how the source data should
 * be interpreted. Deliberately avoids unsupported historical claims.
 */
export default function AboutPage({ onClose }: AboutPageProps) {
  // Modal: contain Tab inside the dialog and restore focus on close.
  const trapRef = useFocusTrap(true);

  // Escape closes the dialog, matching the drawer/sheet/filter overlays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-roman-charcoal/50 motion-safe:animate-[limes-fade-in_150ms_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Over LimesFalsum"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-roman-stone/25 bg-roman-paper shadow-2xl motion-safe:animate-[limes-dialog-in_220ms_cubic-bezier(0.2,0.8,0.3,1)]"
      >
        <div className="flex items-center justify-between border-b border-roman-stone/15 px-5 py-3">
          <h2 className="font-display text-lg font-semibold text-roman-red">Over LimesFalsum</h2>
          <IconButton
            variant="subtle"
            size="md"
            label="Sluit over-pagina"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
        <div className="space-y-4 px-5 py-4 text-sm leading-relaxed text-roman-charcoal">
          <p>
            Ergens langs de Rijn liet iemand een munt vallen — een soldaat bij zijn fort, een
            boer op weg naar de markt, misschien een smokkelaar met vervalsingen. LimesFalsum
            brengt {DATASET_SUMMARY.recordCount} van die munten terug op de kaart: geplateerde
            denarii uit het NUMIS-bestand (Nationaal Numismatisch Archief), gevonden op{" "}
            {DATASET_SUMMARY.uniqueLocationCount} plekken in Nederland.
          </p>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Wat is een geplateerde denarius?
            </h3>
            <p>
              Een munt met een hart van koper en een jasje van zilver: noodgeld, of stiekem
              nagemaakt. Pas als het zilver wegslijt verraadt hij zijn geheim. Vandaar de naam:
              LimesFalsum, de valse grens.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Romeinse wegen-overlay
            </h3>
            <p>
              Wegen, forten en civiele vindplaatsen (villa&apos;s, tempels, mijlpalen) komen
              uit de{" "}
              <a
                href="https://imperium.ahlfeldt.se"
                target="_blank"
                rel="noopener noreferrer"
                className="text-roman-red underline decoration-roman-stone/40 underline-offset-2 hover:decoration-roman-red"
              >
                Digital Atlas of the Roman Empire
              </a>{" "}
              (DARE). De posities en dateringen van de Nederlandse limesforten en de vici /
              boerderijen komen uit eigen onderzoek en gaan vóór op DARE. Benaderde routes
              en twijfelachtige plekken zijn lichter weergegeven.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Hoe zeker zijn de plekken?
            </h3>
            <p>
              Vindplaatsen komen rechtstreeks uit de brondata en delen vaak één gegeneraliseerde
              coördinaat. Opvallend afwijkende coördinaten worden gemarkeerd, nooit stiekem
              aangepast.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Toetsenbord en schermlezers
            </h3>
            <p>
              De kaart is een canvas zonder toetsenbordselectie; alle inhoud is bereikbaar via de
              lijstweergave. Overlays sluiten met Escape.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Brondata en bewerking
            </h3>
            <p>
              Naast de filterwaarden toont elke munt de ongewijzigde NUMIS-velden via
              &ldquo;Bekijk originele NUMIS-gegevens&rdquo;. Datering: {DATASET_SUMMARY.dateMin}–
              {DATASET_SUMMARY.dateMax} n.Chr.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Gemaakt door
            </h3>
            <p>
              Gemaakt door David van Duijvenvoorde, masterstudent en docent geschiedenis aan het
              Visser &apos;t Hooft Lyceum in Leiden, samen met{" "}
              <a
                href="https://digitale-duif.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-roman-red underline decoration-roman-stone/40 underline-offset-2 hover:decoration-roman-red"
              >
                DigitaleDuif
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
