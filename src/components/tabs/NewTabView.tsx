import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Globe,
  Menu,
  Search,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";
import { useSearchEngine } from "../../hooks/useSearchEngine";
import { useBrowserStore } from "../../store/useBrowserStore";

export function NewTabView() {
  const navigate = useBrowserStore((s) => s.navigate);
  const engine = useSearchEngine();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inOtherField =
        target &&
        target !== inputRef.current &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (inOtherField) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    void navigate(query);
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-y-auto bg-[#111114] text-[#F4F4F6]">
      <header className="relative z-20 flex items-center justify-between gap-4 px-6 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2C2C35] bg-[#18181D] font-mono text-xs font-semibold text-[#34D399]">
            K
          </div>
          <span className="text-base font-semibold tracking-tight text-[#F4F4F6]">
            Kanso
          </span>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <div className="flex h-10 items-center rounded-full border border-[#2C2C35] bg-[#18181D] pr-1.5 pl-4 transition-colors focus-within:border-[#34D399]/70">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${engine.name} or enter URL`}
              autoFocus
              className="w-full select-text bg-transparent text-xs text-[#F4F4F6] placeholder-[#9A9AA6]/70 outline-none"
            />

            <button
              type="submit"
              className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#222229] px-3 text-xs font-medium text-[#F4F4F6] transition-colors hover:bg-[#2C2C35]"
            >
              <Search className="h-3.5 w-3.5 text-[#9A9AA6]" />
              <span>Search</span>
            </button>
          </div>
        </form>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => void navigate("https://github.com")}
            className="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-[#9A9AA6] transition-colors hover:bg-[#18181D] hover:text-[#F4F4F6] sm:inline-flex"
          >
            <Terminal className="h-3.5 w-3.5 text-[#34D399]" />
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="New tab menu"
            className="rounded-lg p-2 text-[#9A9AA6] transition-colors hover:bg-[#18181D] hover:text-[#F4F4F6]"
          >
            <Menu className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute top-11 right-0 z-30 w-48 rounded-xl border border-[#2C2C35] bg-[#18181D] p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void navigate(engine.homeUrl);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-[#F4F4F6] hover:bg-[#222229]"
              >
                <span>Open {engine.name}</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-[#9A9AA6]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void navigate("https://v2.tauri.app");
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-[#F4F4F6] hover:bg-[#222229]"
              >
                <span>Tauri Docs</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-[#9A9AA6]" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#F4F4F6] sm:text-[34px]">
          Browse with Kanso.
        </h1>
        <p className="mt-1 text-2xl font-medium tracking-tight text-[#F4F4F6]/90 sm:text-[28px]">
          Clean, fast, and focused.
        </p>

        <div className="mt-8 grid w-full max-w-110 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-between rounded-2xl border border-[#24242C] bg-[#18181D]/90 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#222229] text-[#34D399]">
              <Globe className="h-6 w-6" />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#9A9AA6]">
              Jump straight into {engine.name}, your search engine.
            </p>

            <button
              type="button"
              onClick={() => void navigate(engine.homeUrl)}
              className="mt-5 w-full rounded-lg border border-[#2C2C35] bg-[#222229] px-3.5 py-2 text-xs font-medium text-[#F4F4F6] transition-colors hover:border-[#34D399]/50 hover:bg-[#2A2A33]"
            >
              Open {engine.name}
            </button>
          </div>

          <div className="relative flex flex-col items-center justify-between rounded-2xl border border-[#24242C] bg-[#18181D]/90 p-5">
            <span className="absolute -top-2.5 rounded-md bg-[#34D399] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#111114] uppercase">
              Quick Access
            </span>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#222229] text-[#FBBF24]">
              <Terminal className="h-6 w-6" />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#9A9AA6]">
              Head straight to GitHub for code and repositories.
            </p>

            <button
              type="button"
              onClick={() => void navigate("https://github.com")}
              className="mt-5 w-full rounded-lg bg-[#FBBF24] px-3.5 py-2 text-xs font-semibold text-[#111114] transition-opacity hover:opacity-90"
            >
              Open GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-[#9A9AA6]/80">
          Shortcuts: <span className="text-[#F4F4F6]/80">Ctrl + K</span> or{" "}
          <span className="text-[#F4F4F6]/80">/</span> to focus search
        </p>
      </main>

      <footer className="relative flex w-full items-center justify-end px-6 pb-5">
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2C2C35] bg-[#18181D] px-3 py-1.5 text-xs text-[#9A9AA6] transition-colors hover:bg-[#222229] hover:text-[#F4F4F6]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Focus Search</span>
        </button>
      </footer>
    </div>
  );
}