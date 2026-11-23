import { useCallback } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { LANGUAGE_LOCALES, resolveLanguage, translate, TranslationParams } from "./translate";
import { TranslationKey } from "./translations";

export function useTranslation() {
  const preference = useSettingsStore((state) => state.language);
  const language = resolveLanguage(preference);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language],
  );

  return { t, language, locale: LANGUAGE_LOCALES[language] };
}