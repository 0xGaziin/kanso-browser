import { ReactNode, useState } from "react";
import { Language, TranslationKey } from "../../i18n/translations";
import { useTranslation } from "../../i18n/useTranslation";
import { useDownloadsStore } from "../../store/useDownloadsStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { ThemePreference, useSettingsStore } from "../../store/useSettingsStore";
import {
  CUSTOM_SEARCH_ENGINE_ID,
  isValidSearchTemplate,
  SEARCH_ENGINES,
} from "../../utils/resolveInput";

const INPUT_CLASS =
  "w-full select-text rounded-lg border border-line bg-field px-3 py-2 text-xs text-fg placeholder-muted/70 outline-none transition-colors focus:border-accent/70";

const THEME_OPTIONS: ReadonlyArray<{ value: ThemePreference; labelKey: TranslationKey }> = [
  { value: "light", labelKey: "themeLight" },
  { value: "dark", labelKey: "themeDark" },
  { value: "system", labelKey: "themeSystem" },
];

const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Language; name: string }> = [
  { value: "en", name: "English" },
  { value: "pt", name: "Português" },
];

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full w-full overflow-y-auto bg-chrome">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-8">
        <h1 className="text-xl font-semibold tracking-tight">{t("settings")}</h1>
        <AppearanceSection />
        <LanguageSection />
        <SearchEngineSection />
        <StartupSection />
        <PrivacySection />
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <Section title={t("appearance")} description={t("appearanceDescription")}>
      {THEME_OPTIONS.map((option) => (
        <RadioRow
          key={option.value}
          label={t(option.labelKey)}
          checked={theme === option.value}
          onSelect={() => setTheme(option.value)}
        />
      ))}
    </Section>
  );
}

function LanguageSection() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <Section title={t("language")} description={t("languageDescription")}>
      <RadioRow
        label={t("languageAuto")}
        checked={language === "system"}
        onSelect={() => setLanguage("system")}
      />
      {LANGUAGE_OPTIONS.map((option) => (
        <RadioRow
          key={option.value}
          label={option.name}
          checked={language === option.value}
          onSelect={() => setLanguage(option.value)}
        />
      ))}
    </Section>
  );
}

function SearchEngineSection() {
  const { t } = useTranslation();
  const engineId = useSettingsStore((state) => state.searchEngineId);
  const setSearchEngine = useSettingsStore((state) => state.setSearchEngine);

  return (
    <Section
      title={t("searchEngine")}
      description={t("searchEngineDescription")}
    >
      {SEARCH_ENGINES.map((engine) => (
        <RadioRow
          key={engine.id}
          label={engine.name}
          checked={engineId === engine.id}
          onSelect={() => setSearchEngine(engine.id)}
        />
      ))}

      <RadioRow
        label={t("custom")}
        checked={engineId === CUSTOM_SEARCH_ENGINE_ID}
        onSelect={() => setSearchEngine(CUSTOM_SEARCH_ENGINE_ID)}
      >
        <CustomEngineField />
      </RadioRow>
    </Section>
  );
}

function CustomEngineField() {
  const { t } = useTranslation();
  const customSearchUrl = useSettingsStore((state) => state.customSearchUrl);
  const setCustomSearchUrl = useSettingsStore((state) => state.setCustomSearchUrl);
  const isInvalid = !isValidSearchTemplate(customSearchUrl);

  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="text"
        value={customSearchUrl}
        onChange={(event) => setCustomSearchUrl(event.target.value)}
        placeholder="https://example.com/search?q=%s"
        className={INPUT_CLASS}
      />
      <p className={`text-[11px] ${isInvalid ? "text-danger" : "text-muted"}`}>
        {isInvalid
          ? t("customSearchInvalid")
          : t("customSearchHint")}
      </p>
    </div>
  );
}

function StartupSection() {
  const { t } = useTranslation();
  const startupMode = useSettingsStore((state) => state.startupMode);
  const homepageUrl = useSettingsStore((state) => state.homepageUrl);
  const setStartupMode = useSettingsStore((state) => state.setStartupMode);
  const setHomepageUrl = useSettingsStore((state) => state.setHomepageUrl);

  return (
    <Section title={t("startup")} description={t("startupDescription")}>
      <RadioRow
        label={t("startupNewTab")}
        checked={startupMode === "newtab"}
        onSelect={() => setStartupMode("newtab")}
      />
      <RadioRow
        label={t("startupHomepage")}
        checked={startupMode === "homepage"}
        onSelect={() => setStartupMode("homepage")}
      >
        <input
          type="text"
          value={homepageUrl}
          onChange={(event) => setHomepageUrl(event.target.value)}
          placeholder="example.com"
          className={INPUT_CLASS}
        />
      </RadioRow>
    </Section>
  );
}

function PrivacySection() {
  const { t } = useTranslation();
  const saveHistory = useSettingsStore((state) => state.saveHistory);
  const setSaveHistory = useSettingsStore((state) => state.setSaveHistory);

  return (
    <Section title={t("privacy")}>
      <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2.5">
        <div>
          <p className="text-xs">{t("saveHistory")}</p>
          <p className="text-[11px] text-muted">
            {t("saveHistoryHint")}
          </p>
        </div>
        <Toggle checked={saveHistory} label={t("saveHistory")} onChange={setSaveHistory} />
      </div>

      <ClearDataCard />
    </Section>
  );
}

function ClearDataCard() {
  const { t } = useTranslation();
  const clearHistory = useHistoryStore((state) => state.clear);
  const clearDownloads = useDownloadsStore((state) => state.clear);

  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeDownloads, setIncludeDownloads] = useState(false);
  const [wasCleared, setWasCleared] = useState(false);

  const toggle = (setter: (value: boolean) => void) => (value: boolean) => {
    setter(value);
    setWasCleared(false);
  };

  const handleClear = () => {
    if (includeHistory) clearHistory();
    if (includeDownloads) clearDownloads();
    setWasCleared(true);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface px-3 py-3">
      <p className="text-xs">{t("clearBrowsingData")}</p>

      <Checkbox
        label={t("browsingHistory")}
        checked={includeHistory}
        onChange={toggle(setIncludeHistory)}
      />
      <Checkbox
        label={t("downloadList")}
        checked={includeDownloads}
        onChange={toggle(setIncludeDownloads)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={!includeHistory && !includeDownloads}
          className="rounded-lg border border-line bg-active px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-danger/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("clearData")}
        </button>
        {wasCleared && <span className="text-[11px] text-accent">{t("done")}</span>}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface RadioRowProps {
  label: string;
  checked: boolean;
  onSelect: () => void;
  children?: ReactNode;
}

function RadioRow({ label, checked, onSelect, children }: RadioRowProps) {
  const surface = checked
    ? "border-accent/50 bg-accent/5"
    : "border-line bg-surface";

  return (
    <div className={`rounded-lg border px-3 py-2.5 transition-colors ${surface}`}>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={onSelect}
        className="flex w-full items-center gap-3 text-left text-xs"
      >
        <span
          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
            checked ? "border-accent" : "border-muted/60"
          }`}
        >
          {checked && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        </span>
        <span>{label}</span>
      </button>

      {checked && children && <div className="mt-2.5">{children}</div>}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}

function Toggle({ checked, label, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-accent"
      />
      {label}
    </label>
  );
}