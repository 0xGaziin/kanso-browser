import { ReactNode, useState } from "react";
import { useDownloadsStore } from "../../store/useDownloadsStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { ThemePreference, useSettingsStore } from "../../store/useSettingsStore";
import {
  CUSTOM_SEARCH_ENGINE_ID,
  isValidSearchTemplate,
  SEARCH_ENGINES,
} from "../../utils/resolveInput";

const INPUT_CLASS =
  "w-full select-text rounded-lg border border-[#2C2C35] bg-[#141418] px-3 py-2 text-xs text-[#F4F4F6] placeholder-[#9A9AA6]/70 outline-none transition-colors focus:border-[#34D399]/70";

const THEME_OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match Windows" },
];

export function SettingsPage() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#111114]">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-8">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <AppearanceSection />
        <SearchEngineSection />
        <StartupSection />
        <PrivacySection />
      </div>
    </div>
  );
}

function AppearanceSection() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <Section title="Appearance" description="Choose how Kanso looks.">
      {THEME_OPTIONS.map((option) => (
        <RadioRow
          key={option.value}
          label={option.label}
          checked={theme === option.value}
          onSelect={() => setTheme(option.value)}
        />
      ))}
    </Section>
  );
}

function SearchEngineSection() {
  const engineId = useSettingsStore((state) => state.searchEngineId);
  const setSearchEngine = useSettingsStore((state) => state.setSearchEngine);

  return (
    <Section
      title="Search engine"
      description="Used by the address bar and the new tab page."
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
        label="Custom"
        checked={engineId === CUSTOM_SEARCH_ENGINE_ID}
        onSelect={() => setSearchEngine(CUSTOM_SEARCH_ENGINE_ID)}
      >
        <CustomEngineField />
      </RadioRow>
    </Section>
  );
}

function CustomEngineField() {
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
      <p className={`text-[11px] ${isInvalid ? "text-[#F87171]" : "text-[#9A9AA6]"}`}>
        {isInvalid
          ? "Enter an http(s) address with %s where the search terms go. Until then, DuckDuckGo is used."
          : "%s is replaced by what you type."}
      </p>
    </div>
  );
}

function StartupSection() {
  const startupMode = useSettingsStore((state) => state.startupMode);
  const homepageUrl = useSettingsStore((state) => state.homepageUrl);
  const setStartupMode = useSettingsStore((state) => state.setStartupMode);
  const setHomepageUrl = useSettingsStore((state) => state.setHomepageUrl);

  return (
    <Section title="On startup" description="What Kanso shows when it opens.">
      <RadioRow
        label="Open the new tab page"
        checked={startupMode === "newtab"}
        onSelect={() => setStartupMode("newtab")}
      />
      <RadioRow
        label="Open a specific page"
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
  const saveHistory = useSettingsStore((state) => state.saveHistory);
  const setSaveHistory = useSettingsStore((state) => state.setSaveHistory);

  return (
    <Section title="Privacy">
      <div className="flex items-center justify-between rounded-lg border border-[#24242C] bg-[#18181D] px-3 py-2.5">
        <div>
          <p className="text-xs">Save browsing history</p>
          <p className="text-[11px] text-[#9A9AA6]">
            Turning this off does not delete existing history.
          </p>
        </div>
        <Toggle checked={saveHistory} label="Save browsing history" onChange={setSaveHistory} />
      </div>

      <ClearDataCard />
    </Section>
  );
}

function ClearDataCard() {
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
    <div className="flex flex-col gap-3 rounded-lg border border-[#24242C] bg-[#18181D] px-3 py-3">
      <p className="text-xs">Clear browsing data</p>

      <Checkbox
        label="Browsing history"
        checked={includeHistory}
        onChange={toggle(setIncludeHistory)}
      />
      <Checkbox
        label="Download list (files stay on disk)"
        checked={includeDownloads}
        onChange={toggle(setIncludeDownloads)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={!includeHistory && !includeDownloads}
          className="rounded-lg border border-[#2C2C35] bg-[#222229] px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-[#F87171]/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear data
        </button>
        {wasCleared && <span className="text-[11px] text-[#34D399]">Done</span>}
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
        {description && <p className="text-xs text-[#9A9AA6]">{description}</p>}
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
    ? "border-[#34D399]/50 bg-[#34D399]/5"
    : "border-[#24242C] bg-[#18181D]";

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
            checked ? "border-[#34D399]" : "border-[#9A9AA6]/60"
          }`}
        >
          {checked && <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />}
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
        checked ? "bg-[#34D399]" : "bg-[#2C2C35]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-[#F4F4F6] transition-transform ${
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
        className="h-3.5 w-3.5 accent-[#34D399]"
      />
      {label}
    </label>
  );
}