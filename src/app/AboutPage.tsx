import { X } from "lucide-react";
import { DATASET_SUMMARY } from "../hooks/useCoinFilters";

interface AboutPageProps {
  onClose: () => void;
}

/**
 * Concise explanation of what LimesFalsum is and how the source data should
 * be interpreted. Deliberately avoids unsupported historical claims.
 */
export default function AboutPage({ onClose }: AboutPageProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-roman-charcoal/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Over LimesFalsum"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-roman-stone/25 bg-roman-paper shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-roman-stone/15 px-5 py-3">
          <h2 className="font-display text-lg font-semibold text-roman-red">Over LimesFalsum</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluit over-pagina"
            className="rounded p-1 text-roman-stone hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4 text-sm leading-relaxed text-roman-charcoal">
          <p>
            Ergens langs de Rijn, bijna tweeduizend jaar geleden, liet iemand een munt vallen —
            een soldaat bij het Limes-fort, een boer op weg naar de markt, misschien een
            smokkelaar met een handvol vervalsingen. LimesFalsum brengt{" "}
            {DATASET_SUMMARY.recordCount} van die verloren munten terug op de kaart: geplateerde
            denarii, gevonden op {DATASET_SUMMARY.uniqueLocationCount} plekken in Nederland en
            vastgelegd in het NUMIS-bestand (Nationaal Numismatisch Archief).
          </p>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Wat is een geplateerde denarius?
            </h3>
            <p>
              Een munt met een hart van koper en een jasje van zilver. Officieel noodgeld in
              tijden van schaarste, of stiekem nagemaakt toen niemand keek. Pas als de zilverlaag
              wegslijt — of de munt breekt — verraadt hij zijn geheim. Vandaar de naam:
              LimesFalsum, de valse grens.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Hoe zeker zijn de plekken?
            </h3>
            <p>
              De getoonde locaties komen rechtstreeks uit de brondata (RD-coördinaten, EPSG:28992)
              en kunnen onzekerheid bevatten. Meerdere munten delen vaak één gegeneraliseerde
              archeologische coördinaat — zo&apos;n vindplaats wordt als één punt met een aantal
              getoond. Records waarvan de coördinaat opvallend afwijkt worden gemarkeerd, nooit
              stilzwijgend aangepast.
            </p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-roman-stone">
              Brondata en bewerking
            </h3>
            <p>
              Elke munt toont naast genormaliseerde filterwaarden ook de ongewijzigde originele
              NUMIS-velden via &ldquo;Bekijk originele NUMIS-gegevens&rdquo;. De datering loopt in
              deze dataset van {DATASET_SUMMARY.dateMin} tot {DATASET_SUMMARY.dateMax} n.Chr.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
