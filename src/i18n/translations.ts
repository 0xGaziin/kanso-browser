export type Language = "en" | "pt";

const en = {
  // Tabs & Navigation
  newTab: "New Tab",
  closeTab: "Close tab",
  back: "Back",
  forward: "Forward",
  reload: "Reload",
  stopLoading: "Stop loading",
  home: "Home",
  searchPlaceholder: "Search or enter address",

  // Bookmarks & History
  bookmarks: "Bookmarks",
  addBookmark: "Add bookmark",
  removeBookmark: "Remove bookmark",
  history: "History",
  clearHistory: "Clear history",
  noHistory: "No browsing history yet",

  // Downloads
  downloads: "Downloads",
  noDownloads: "No downloads yet",

  // Settings
  settings: "Settings",
  general: "General",
  appearance: "Appearance",
  privacy: "Privacy & Security",
  about: "About Kanso",

  // Appearance & Language
  theme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  language: "Language",
  languageAuto: "System default",

  // Search Engine & Privacy
  searchEngine: "Search engine",
  clearDataOnExit: "Clear browsing data on exit",
  blockTrackers: "Block third-party trackers",

  // About / Support
  version: "Version",
  supportKanso: "Support Kanso",
} as const;

export type TranslationKey = keyof typeof en;

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  pt: {
    // Tabs & Navigation
    newTab: "Nova Aba",
    closeTab: "Fechar aba",
    back: "Voltar",
    forward: "Avançar",
    reload: "Recarregar",
    stopLoading: "Parar carregamento",
    home: "Início",
    searchPlaceholder: "Pesquisar ou digitar endereço",

    // Bookmarks & History
    bookmarks: "Favoritos",
    addBookmark: "Adicionar aos favoritos",
    removeBookmark: "Remover dos favoritos",
    history: "Histórico",
    clearHistory: "Limpar histórico",
    noHistory: "Nenhum histórico de navegação",

    // Downloads
    downloads: "Downloads",
    noDownloads: "Nenhum download ainda",

    // Settings
    settings: "Configurações",
    general: "Geral",
    appearance: "Aparência",
    privacy: "Privacidade e Segurança",
    about: "Sobre o Kanso",

    // Appearance & Language
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeSystem: "Sistema",
    language: "Idioma",
    languageAuto: "Padrão do sistema",

    // Search Engine & Privacy
    searchEngine: "Mecanismo de busca",
    clearDataOnExit: "Limpar dados de navegação ao sair",
    blockTrackers: "Bloquear rastreadores de terceiros",

    // About / Support
    version: "Versão",
    supportKanso: "Apoiar o Kanso",
  },
};