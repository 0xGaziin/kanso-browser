import { getInternalPage } from "../../utils/internalPages";
import { NewTabView } from "../tabs/NewTabView";
import { BookmarksPage } from "./BookmarksPage.tsx";
import { DownloadsPage } from "./DownloadsPage";
import { HistoryPage } from "./HistoryPage.tsx";
import { SettingsPage } from "./SettingsPage.tsx";

// Renders the React page behind a `kanso://` URL.
export function InternalPageView({ url }: { url: string }) {
  switch (getInternalPage(url)) {
    case "history":
      return <HistoryPage />;
    case "downloads":
      return <DownloadsPage />;
    case "bookmarks":
      return <BookmarksPage />;
    case "settings":
      return <SettingsPage />;
    default:
      return <NewTabView />;
  }
}