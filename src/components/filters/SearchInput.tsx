import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export function SearchInput({ value, onChange, compact = false }: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-roman-stone"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Zoek op keizer, plaats, NUMIS-nummer..."
        aria-label="Zoek muntvondsten"
        className={`w-full rounded-md border border-roman-stone/30 bg-roman-paper pl-8 pr-3 text-sm text-roman-charcoal placeholder:text-roman-stone/70 focus:border-roman-red focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-roman-red/40 ${
          compact ? "py-1.5" : "py-2"
        }`}
      />
    </div>
  );
}
