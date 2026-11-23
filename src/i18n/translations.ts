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
  menu: "Menu",
  exit: "Exit",
  trackersBlocked: "Trackers blocked in this tab: {count}",

  // Window controls
  minimize: "Minimize",
  maximize: "Maximize",
  restore: "Restore",
  closeWindow: "Close",

  // Bookmarks & History
  bookmarks: "Bookmarks",
  addBookmark: "Add bookmark",
  removeBookmark: "Remove bookmark",
  bookmarksHint: "Use the star in the address bar to save the page you are on.",
  noBookmarks: "No bookmarks yet",
  history: "History",
  historyDescription: "Pages you visited. History is stored only on this device.",
  clearHistory: "Clear history",
  searchHistory: "Search history",
  noHistory: "No browsing history yet",
  noHistoryMatches: "No pages match your search.",
  confirmClearHistory: "Clear all browsing history?",
  removeFromHistory: "Remove from history",
  today: "Today",
  yesterday: "Yesterday",

  // Downloads
  downloads: "Downloads",
  downloadsDescription: "Files are saved to your Downloads folder.",
  noDownloads: "No downloads yet",
  clearList: "Clear list",
  downloadDownloading: "Downloading…",
  downloadCompleted: "Completed",
  downloadFailed: "Failed",
  openFile: "Open",
  showInFolder: "Show in folder",
  remove: "Remove",

  // Settings
  settings: "Settings",
  general: "General",
  appearance: "Appearance",
  appearanceDescription: "Choose how Kanso looks.",
  privacy: "Privacy & Security",
  about: "About Kanso",

  // Appearance & Language
  theme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  language: "Language",
  languageAuto: "System default",
  languageDescription: "Choose the language of the interface.",

  // Search Engine & Privacy
  searchEngine: "Search engine",
  searchEngineDescription: "Used by the address bar and the new tab page.",
  custom: "Custom",
  customSearchInvalid: "Enter an http(s) address with %s where the search terms go. Until then, DuckDuckGo is used.",
  customSearchHint: "%s is replaced by what you type.",
  clearDataOnExit: "Clear browsing data on exit",
  blockTrackers: "Block third-party trackers",
  saveHistory: "Save browsing history",
  saveHistoryHint: "Turning this off does not delete existing history.",
  clearBrowsingData: "Clear browsing data",
  browsingHistory: "Browsing history",
  downloadList: "Download list (files stay on disk)",
  clearData: "Clear data",
  done: "Done",

  // Startup
  startup: "On startup",
  startupDescription: "What Kanso shows when it opens.",
  startupNewTab: "Open the new tab page",
  startupHomepage: "Open a specific page",

  // New tab page
  newTabTitle: "Browse with Kanso.",
  newTabSubtitle: "Clean, fast, and focused.",
  searchEngineOrUrl: "Search {engine} or enter URL",
  search: "Search",
  newTabMenu: "New tab menu",
  openEngine: "Open {engine}",
  openGithub: "Open GitHub",
  tauriDocs: "Tauri Docs",
  engineCardText: "Jump straight into {engine}, your search engine.",
  githubCardText: "Head straight to GitHub for code and repositories.",
  quickAccess: "Quick Access",
  shortcutsPrefix: "Shortcuts:",
  shortcutsOr: "or",
  shortcutsSuffix: "to focus search",
  focusSearch: "Focus Search",

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
    menu: "Menu",
    exit: "Sair",
    trackersBlocked: "Rastreadores bloqueados nesta aba: {count}",

    // Window controls
    minimize: "Minimizar",
    maximize: "Maximizar",
    restore: "Restaurar",
    closeWindow: "Fechar",

    // Bookmarks & History
    bookmarks: "Favoritos",
    addBookmark: "Adicionar aos favoritos",
    removeBookmark: "Remover dos favoritos",
    bookmarksHint: "Use a estrela na barra de endereço para salvar a página em que você está.",
    noBookmarks: "Nenhum favorito ainda",
    history: "Histórico",
    historyDescription: "Páginas que você visitou. O histórico fica salvo apenas neste dispositivo.",
    clearHistory: "Limpar histórico",
    searchHistory: "Pesquisar no histórico",
    noHistory: "Nenhum histórico de navegação",
    noHistoryMatches: "Nenhuma página corresponde à pesquisa.",
    confirmClearHistory: "Limpar todo o histórico de navegação?",
    removeFromHistory: "Remover do histórico",
    today: "Hoje",
    yesterday: "Ontem",

    // Downloads
    downloads: "Downloads",
    downloadsDescription: "Os arquivos são salvos na sua pasta Downloads.",
    noDownloads: "Nenhum download ainda",
    clearList: "Limpar lista",
    downloadDownloading: "Baixando…",
    downloadCompleted: "Concluído",
    downloadFailed: "Falhou",
    openFile: "Abrir",
    showInFolder: "Mostrar na pasta",
    remove: "Remover",

    // Settings
    settings: "Configurações",
    general: "Geral",
    appearance: "Aparência",
    appearanceDescription: "Escolha a aparência do Kanso.",
    privacy: "Privacidade e Segurança",
    about: "Sobre o Kanso",

    // Appearance & Language
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeSystem: "Sistema",
    language: "Idioma",
    languageAuto: "Padrão do sistema",
    languageDescription: "Escolha o idioma da interface.",

    // Search Engine & Privacy
    searchEngine: "Mecanismo de busca",
    searchEngineDescription: "Usado pela barra de endereço e pela página de nova aba.",
    custom: "Personalizado",
    customSearchInvalid: "Informe um endereço http(s) com %s onde os termos da busca devem entrar. Até lá, o DuckDuckGo será usado.",
    customSearchHint: "%s é substituído pelo que você digitar.",
    clearDataOnExit: "Limpar dados de navegação ao sair",
    blockTrackers: "Bloquear rastreadores de terceiros",
    saveHistory: "Salvar histórico de navegação",
    saveHistoryHint: "Desativar isso não apaga o histórico existente.",
    clearBrowsingData: "Limpar dados de navegação",
    browsingHistory: "Histórico de navegação",
    downloadList: "Lista de downloads (os arquivos continuam no disco)",
    clearData: "Limpar dados",
    done: "Concluído",

    // Startup
    startup: "Ao iniciar",
    startupDescription: "O que o Kanso mostra ao abrir.",
    startupNewTab: "Abrir a página de nova aba",
    startupHomepage: "Abrir uma página específica",

    // New tab page
    newTabTitle: "Navegue com o Kanso.",
    newTabSubtitle: "Limpo, rápido e focado.",
    searchEngineOrUrl: "Pesquisar no {engine} ou digitar URL",
    search: "Pesquisar",
    newTabMenu: "Menu da nova aba",
    openEngine: "Abrir {engine}",
    openGithub: "Abrir GitHub",
    tauriDocs: "Documentação do Tauri",
    engineCardText: "Vá direto para o {engine}, seu mecanismo de busca.",
    githubCardText: "Vá direto ao GitHub para código e repositórios.",
    quickAccess: "Acesso rápido",
    shortcutsPrefix: "Atalhos:",
    shortcutsOr: "ou",
    shortcutsSuffix: "para focar a busca",
    focusSearch: "Focar na busca",

    // About / Support
    version: "Versão",
    supportKanso: "Apoiar o Kanso",
  },
};