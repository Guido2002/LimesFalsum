import { ArrowLeft } from "lucide-react";
import type { CoinRecord } from "../../domain/coin";
import { formatDating } from "../../lib/dates";
import { CoinMetadata } from "./CoinMetadata";

/** Restrained denarius silhouette — a placeholder, never a fake photo. */
function CoinPlaceholder() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-14 w-14 shrink-0"
      role="img"
      aria-label="Denarius-symbool"
    >
      <circle cx="24" cy="24" r="22" fill="#F3EBDD" stroke="#A27A44" strokeWidth="2" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="#C39A56" strokeWidth="1" />
      <path
        d="M19 32 q-4 -9 5 -15 q9 6 5 15"
        fill="none"
        stroke="#8A2E25"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
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
        <CoinPlaceholder />
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
      <CoinMetadata coin={coin} />
    </div>
  );
}
