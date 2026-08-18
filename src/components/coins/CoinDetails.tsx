import { ArrowLeft } from "lucide-react";
import type { CoinRecord } from "../../domain/coin";
import { formatDating } from "../../lib/dates";
import { CoinMetadata } from "./CoinMetadata";

/** Engraved denarius emblem — a portrait bust, never a fake photo. */
function CoinEmblem() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-14 w-14 shrink-0 drop-shadow-sm"
      role="img"
      aria-label="Gestileerde denarius met keizerlijk portret"
    >
      <circle cx="24" cy="24" r="22" fill="#F3EBDD" stroke="#A27A44" strokeWidth="2" />
      {/* Milled edge — tiny ticks like a real denarius rim */}
      <circle
        cx="24"
        cy="24"
        r="19.5"
        fill="none"
        stroke="#A27A44"
        strokeWidth="2.5"
        strokeDasharray="1.2 2.3"
        opacity="0.6"
      />
      {/* Laureate bust: head, neck and bust outline in profile */}
      <g fill="none" stroke="#8A2E25" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Head: crown sweeping to nose and chin */}
        <path d="M17 18 q7 -4.5 10.5 1 q1.2 1.8 -0.6 3.4 q0.4 2.4 -2.4 3.6 q-4 1.7 -7 -0.8" />
        {/* Neck and bust */}
        <path d="M17.5 25.5 q-0.5 3.5 -2.5 5 q5 3.5 12.5 2.5 q-1.5 -3 -2 -6" />
        {/* Laurel wreath above the crown */}
        <path d="M17.5 16.8 q7 -4.8 12.8 -0.6" stroke="#A27A44" strokeWidth="1.3" />
      </g>
      {/* Worn legend — broken arc of letters around the rim */}
      <path
        id="legend-arc"
        d="M24 6.5 a17.5 17.5 0 0 1 14 7"
        fill="none"
      />
      <text fontSize="4.5" fill="#7A5A2E" letterSpacing="1.6" fontFamily="Georgia, serif">
        <textPath href="#legend-arc">IMP C A E S</textPath>
      </text>
    </svg>
  );
}

/** One warm line of story for the record — only claims the data supports. */
function coinStory(coin: CoinRecord): string {
  const yearsAgo = coin.dateEnd ?? coin.dateStart;
  const yearsText = yearsAgo
    ? `zo'n ${(Math.round((2025 - yearsAgo) / 50) * 50).toLocaleString("nl-NL")} jaar geleden`
    : "in de Romeinse tijd";
  const findText = coin.detectorUsed === true
    ? "kwam pas onlangs weer boven met een metaaldetector"
    : coin.detectorUsed === false
      ? "werd zonder detector gevonden"
      : "werd opnieuw ontdekt";
  return `Deze munt raakte ${yearsText} zoek in de bodem bij ${coin.municipality} — en ${findText}.`;
}

interface CoinDetailsProps {
  coin: CoinRecord;
  /** When opened from a multi-coin location, offer a way back */
  onBack?: () => void;
}

export function CoinDetails({ coin, onBack }: CoinDetailsProps) {
  return (
    <div className="pb-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mx-4 mt-3 inline-flex items-center gap-1.5 rounded px-1 py-1 text-sm font-medium text-roman-red hover:bg-roman-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-roman-red"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Terug naar vindplaats
        </button>
      )}
      <header className="flex items-start gap-3 px-4 pb-3 pt-3">
        <CoinEmblem />
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold leading-tight text-roman-charcoal">
            {coin.authorityNormalized[0] ?? coin.authorityRaw}
          </h2>
          <p className="mt-0.5 text-sm text-roman-stone">
            {coin.objectRaw} · {formatDating(coin.dateStart, coin.dateEnd)}
            {coin.dateUncertain ? " (?)" : ""}
          </p>
          <p className="mt-0.5 text-sm text-roman-stone">
            {coin.municipality}, {coin.province}
          </p>
        </div>
      </header>
      <p className="mx-4 mb-3 rounded-md border border-roman-gold/30 bg-roman-parchment/60 px-3 py-2 font-display text-[13px] italic leading-relaxed text-roman-charcoal">
        {coinStory(coin)}
      </p>
      <CoinMetadata coin={coin} />
    </div>
  );
}
