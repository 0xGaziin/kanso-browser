use serde::Deserialize;
use tauri::menu::{ContextMenu, Menu, MenuEvent, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Emitter, Wry};

use crate::error::BrowserError;
use crate::tabs::main_window;

const MENU_ACTION_EVENT: &str = "menu:action";
const QUIT_ID: &str = "quit";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MenuLabels {
    new_tab: String,
    history: String,
    downloads: String,
    bookmarks: String,
    settings: String,
    exit: String,
}

fn build_browser_menu(app: &AppHandle, labels: &MenuLabels) -> Result<Menu<Wry>, BrowserError> {
    let new_tab = MenuItem::with_id(app, "new-tab", &labels.new_tab, true, None::<&str>)?;
    let history = MenuItem::with_id(app, "history", &labels.history, true, None::<&str>)?;
    let downloads = MenuItem::with_id(app, "downloads", &labels.downloads, true, None::<&str>)?;
    let bookmarks = MenuItem::with_id(app, "bookmarks", &labels.bookmarks, true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", &labels.settings, true, None::<&str>)?;
    let quit = MenuItem::with_id(app, QUIT_ID, &labels.exit, true, None::<&str>)?;
    let separator_top = PredefinedMenuItem::separator(app)?;
    let separator_bottom = PredefinedMenuItem::separator(app)?;

    Ok(Menu::with_items(
        app,
        &[
            &new_tab,
            &separator_top,
            &history,
            &downloads,
            &bookmarks,
            &separator_bottom,
            &settings,
            &quit,
        ],
    )?)
}

// Native popups are required on the main thread because child webviews render above the React UI.
#[tauri::command]
pub async fn show_browser_menu(app: AppHandle, labels: MenuLabels) -> Result<(), BrowserError> {
    let window = main_window(&app)?;
    let menu = build_browser_menu(&app, &labels)?;

    app.run_on_main_thread(move || {
        if let Err(err) = menu.popup(window) {
            eprintln!("[Kanso] failed to show menu: {err}");
        }
    })?;
    Ok(())
}

pub fn handle_menu_event(app: &AppHandle, event: MenuEvent) {
    let id = event.id().0.as_str();

    if id == QUIT_ID {
        app.exit(0);
        return;
    }

    if let Err(err) = app.emit(MENU_ACTION_EVENT, id) {
        eprintln!("[Kanso] failed to emit {MENU_ACTION_EVENT}: {err}");
    }
}