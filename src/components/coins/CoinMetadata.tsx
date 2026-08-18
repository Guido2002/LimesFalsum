import { Info } from "lucide-react";
import type { CoinRecord } from "../../domain/coin";
import { Tooltip } from "../ui/Tooltip";

interface Field {
  label: string;
  value?: string | number | null;
}

/** Render a label/value grid, skipping empty fields entirely. */
function FieldGrid({ fields }: { fields: Field[] }) {
  const visible = fields.filter(
    (f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== "",
  );
  if (visible.length === 0) return null;
  return (
    <dl className="grid grid-cols-[minmax(110px,auto)_1fr] gap-x-4 gap-y-1.5 text-sm">
      {visible.map((f) => (
        <div key={f.label} className="contents">
          <dt className="text-roman-stone">{f.label}</dt>
          <dd className="text-roman-charcoal">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-roman-stone/15 px-4 py-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-roman-stone">
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Structured metadata for one coin. Two layers are visible:
 * normalized values up front, raw NUMIS values in the expandable section.
 */
export function CoinMetadata({ coin }: { coin: CoinRecord }) {
  const massDisplay =
    coin.hasKnownMass && coin.massGram !== undefined ? `${coin.massGram} g` : undefined;

  return (
    <div>
      {coin.dataQualityFlags.length > 0 && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-md border border-roman-gold/40 bg-roman-parchment px-3 py-2 text-xs text-roman-charcoal">
          <Tooltip label="Dit record bevat brongegevens met onzekerheid.">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-roman-bronze" aria-hidden />
          </Tooltip>
          <span>
            {coin.dataQualityFlags.includes("coordinate-outlier")
              ? "De plek in de brondata wijkt mogelijk af — deze munt ligt misschien net ergens anders."
              : "De brondata van deze munt bevat onzekerheid."}
          </span>
        </div>
      )}

      <Section title="Algemeen">
        <FieldGrid
          fields={[
            { label: "Autoriteit", value: coin.authorityRaw },
            { label: "Datering", value: coin.datingRaw },
            { label: "Voorwerp", value: coin.objectRaw },
            { label: "Status", value: coin.statusRaw },
            { label: "Materiaal", value: coin.materialRaw },
            { label: "Productieplaats", value: coin.mintRaw },
            { label: "Vindplaats", value: `${coin.municipality}, ${coin.province}` },
            { label: "Datum vondst", value: coin.findDateRaw },
            { label: "Karakter vondst", value: coin.findCharacter },
            { label: "Massa", value: massDisplay },
            {
              label: "Diameter",
              value: coin.diameterMm !== undefined ? `${coin.diameterMm} mm` : undefined,
            },
          ]}
        />
      </Section>

      <Section title="Identificatie">
        <FieldGrid
          fields={[
            { label: "NUMIS-nummer", value: coin.numisId },
            { label: "PAN-nummer", value: coin.panId },
            { label: "Catalogus", value: coin.catalogue },
            { label: "Inventarisnummer", value: coin.inventoryNumber },
            { label: "Nr. in vondst", value: coin.findNumber },
          ]}
        />
      </Section>

      <Section title="Archeologische context">
        <FieldGrid
          fields={[
            { label: "Werkzaamheden", value: coin.excavationContext },
            { label: "Terrein", value: coin.terrainRaw },
            { label: "Metaaldetector", value: coin.metalDetectorRaw },
            { label: "Vondstnaam", value: coin.findName },
            { label: "Bewerking", value: coin.treatment },
            { label: "Politieke staat", value: coin.politicalState },
          ]}
        />
      </Section>

      <Section title="Coördinaten">
        <FieldGrid
          fields={[
            { label: "RD X", value: coin.rdX },
            { label: "RD Y", value: coin.rdY },
          ]}
        />
        <details className="mt-2 text-xs text-roman-stone">
          <summary className="cursor-pointer select-none hover:text-roman-charcoal">
            Technisch: WGS84 (afgeleid van EPSG:28992)
          </summary>
          <p className="mt-1 font-mono">
            {coin.latitude.toFixed(6)}, {coin.longitude.toFixed(6)}
          </p>
        </details>
      </Section>

      {coin.notes && (
        <Section title="Opmerkingen">
          <p className="whitespace-pre-line text-sm text-roman-charcoal">{coin.notes}</p>
        </Section>
      )}

      <details className="border-t border-roman-stone/15 px-4 py-3">
        <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wide text-roman-stone hover:text-roman-charcoal">
          Bekijk originele NUMIS-gegevens
        </summary>
        <dl className="mt-2 space-y-1 text-xs">
          {RAW_FIELDS.map(({ key, label }) => {
            const value = coin[key];
            if (value === undefined || value === null || value === "") return null;
            return (
              <div key={key} className="grid grid-cols-[minmax(150px,auto)_1fr] gap-x-3">
                <dt className="text-roman-stone">{label}</dt>
                <dd className="break-words text-roman-charcoal">{String(value)}</dd>
              </div>
            );
          })}
        </dl>
      </details>
    </div>
  );
}

const RAW_FIELDS: { key: keyof CoinRecord; label: string }[] = [
  { key: "numisId", label: "F 3007 NUMIS nummer" },
  { key: "panId", label: "F 3012 PAN nummer" },
  { key: "diameterMm", label: "F 1401 diameter / horizontaal formaat" },
  { key: "province", label: "F 3102 provincie" },
  { key: "municipality", label: "F 3103 gemeente" },
  { key: "findDateRaw", label: "F 3001 datum vondst" },
  { key: "findName", label: "F 3006 vondstnaam" },
  { key: "catalogue", label: "F 1601 catalogi" },
  { key: "findCharacter", label: "F 3203 karakter vondst" },
  { key: "findNumber", label: "F 3005 nr in vondst" },
  { key: "politicalState", label: "F 1004 politieke staat" },
  { key: "authorityRaw", label: "F 1005 autoriteit of opdrachtgever" },
  { key: "statusRaw", label: "F 1503 status of functie" },
  { key: "objectRaw", label: "F 1006 voorwerp" },
  { key: "materialRaw", label: "F 1406 materiaal" },
  { key: "mintRaw", label: "F 1204 productieplaats" },
  { key: "datingRaw", label: "F 1101 datering" },
  { key: "massGram", label: "F 1404 massa" },
  { key: "excavationContext", label: "F 3202 welk werk" },
  { key: "notes", label: "F 5001 opmerkingen" },
  { key: "rdX", label: "F 3110 horizontale coördinaat" },
  { key: "rdY", label: "F 3111 verticale coördinaat" },
  { key: "treatment", label: "F 1314 bewerking" },
  { key: "inventoryNumber", label: "F 2003 inventarisnummer" },
  { key: "terrainRaw", label: "F 3201 soort terrein" },
  { key: "metalDetectorRaw", label: "F 3204 metaaldetector" },
];
