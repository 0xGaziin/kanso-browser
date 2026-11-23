import { Clock, Globe, LucideIcon, Search, Star } from "lucide-react";
import { SUGGESTION_ROW_HEIGHT } from "../../utils/suggestionLayout";
import { Suggestion, SuggestionKind } from "../../utils/suggestions";

const ICONS: Record<SuggestionKind, LucideIcon> = {
  navigate: Globe,
  search: Search,
  bookmark: Star,
  history: Clock,
};

interface SuggestionListProps {
  id: string;
  suggestions: Suggestion[];
  activeIndex: number;
  onPick: (target: string) => void;
}

// Fills the overlay webview; height is controlled externally via suggestionListHeight.
export function SuggestionList({ id, suggestions, activeIndex, onPick }: SuggestionListProps) {
  return (
    <ul
      id={id}
      role="listbox"
      className="h-full w-full overflow-hidden border border-[#2C2C35] bg-[#18181D] py-1"
    >
      {suggestions.map((suggestion, index) => {
        const Icon = ICONS[suggestion.kind];

        return (
          <li
            key={suggestion.id}
            role="option"
            aria-selected={index === activeIndex}
            // Uses onPointerDown instead of click so focusing this overlay webview does not dismiss the list first.
            onPointerDown={(event) => {
              event.preventDefault();
              onPick(suggestion.target);
            }}
            style={{ height: SUGGESTION_ROW_HEIGHT }}
            className={`flex cursor-pointer items-center gap-2.5 px-3 text-xs hover:bg-[#1E1E24] ${
              index === activeIndex ? "bg-[#222229]" : ""
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#9A9AA6]" />
            <span className="truncate text-[#F4F4F6]">{suggestion.label}</span>
            {suggestion.detail && (
              <span className="truncate text-[11px] text-[#9A9AA6]">{suggestion.detail}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}