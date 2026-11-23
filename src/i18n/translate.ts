import { Language, TranslationKey, translations } from "./translations";

export type LanguagePreference = Language | "system";
export type TranslationParams = Record<string, string | number>;

export const LANGUAGE_LOCALES: Record<Language, string> = {
  en: "en-US",
  pt: "pt-BR",
};

export function resolveLanguage(
  preference: LanguagePreference,
  systemLocale: string = navigator.language,
): Language {
  if (preference !== "system") return preference;
  return systemLocale.toLowerCase().startsWith("pt") ? "pt" : "en";
}

// Looks up a key and fills `{name}` placeholders from `params`.
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const template = translations[language][key];
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}