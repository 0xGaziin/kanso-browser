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
import { useTranslation } from "../../i18n/useTranslation";
import { useBrowserStore } from "../../store/useBrowserStore";

export function NewTabView() {
  const navigate = useBrowserStore((s) => s.navigate);
  const engine = useSearchEngine();
  const { t } = useTranslation();
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
    <div className="relative flex h-full w-full flex-col justify-between overflow-y-auto bg-chrome text-fg">
      <header className="relative z-20 flex items-center justify-between gap-4 px-6 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs font-semibold text-accent">
            K
          </div>
          <span className="text-base font-semibold tracking-tight text-fg">
            Kanso v0.1.1
          </span>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <div className="flex h-10 items-center rounded-full border border-line bg-surface pr-1.5 pl-4 transition-colors focus-within:border-accent/70">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchEngineOrUrl", { engine: engine.name })}
              autoFocus
              className="w-full select-text bg-transparent text-xs text-fg placeholder-muted/70 outline-none"
            />

            <button
              type="submit"
              className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-active px-3 text-xs font-medium text-fg transition-colors hover:bg-line"
            >
              <Search className="h-3.5 w-3.5 text-muted" />
              <span>{t("search")}</span>
            </button>
          </div>
        </form>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => void navigate("https://github.com")}
            className="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-surface hover:text-fg sm:inline-flex"
          >
            <Terminal className="h-3.5 w-3.5 text-accent" />
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={t("newTabMenu")}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <Menu className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute top-11 right-0 z-30 w-48 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void navigate(engine.homeUrl);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-fg hover:bg-active"
              >
                <span>{t("openEngine", { engine: engine.name })}</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void navigate("https://v2.tauri.app");
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-fg hover:bg-active"
              >
                <span>{t("tauriDocs")}</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-[34px]">
          {t("newTabTitle")}
        </h1>
        <p className="mt-1 text-2xl font-medium tracking-tight text-fg/90 sm:text-[28px]">
          {t("newTabSubtitle")}
        </p>

        <div className="mt-8 grid w-full max-w-110 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-between rounded-2xl border border-line bg-surface/90 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-active text-accent">
              <Globe className="h-6 w-6" />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              {t("engineCardText", { engine: engine.name })}
            </p>

            <button
              type="button"
              onClick={() => void navigate(engine.homeUrl)}
              className="mt-5 w-full rounded-lg border border-line bg-active px-3.5 py-2 text-xs font-medium text-fg transition-colors hover:border-accent/50 hover:bg-line"
            >
              {t("openEngine", { engine: engine.name })}
            </button>
          </div>

          <div className="relative flex flex-col items-center justify-between rounded-2xl border border-line bg-surface/90 p-5">
            <span className="absolute -top-2.5 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#111114] uppercase">
              {t("quickAccess")}
            </span>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-active text-[#FBBF24]">
              <Terminal className="h-6 w-6" />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              {t("githubCardText")}
            </p>

            <button
              type="button"
              onClick={() => void navigate("https://github.com")}
              className="mt-5 w-full rounded-lg bg-[#FBBF24] px-3.5 py-2 text-xs font-semibold text-[#111114] transition-opacity hover:opacity-90"
            >
              {t("openGithub")}
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted/80">
          {t("shortcutsPrefix")} <span className="text-fg/80">Ctrl + K</span> {t("shortcutsOr")}{" "}
          <span className="text-fg/80">/</span> {t("shortcutsSuffix")}
        </p>
      </main>

      <footer className="relative flex w-full items-center justify-end px-6 pb-5">
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:bg-active hover:text-fg"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{t("focusSearch")}</span>
        </button>
      </footer>
    </div>
  );
}