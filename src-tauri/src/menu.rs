use tauri::menu::{ContextMenu, Menu, MenuEvent, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Emitter, Wry};

use crate::error::BrowserError;
use crate::tabs::main_window;

const MENU_ACTION_EVENT: &str = "menu:action";
const QUIT_ID: &str = "quit";

fn build_browser_menu(app: &AppHandle) -> Result<Menu<Wry>, BrowserError> {
    let new_tab = MenuItem::with_id(app, "new-tab", "New tab", true, None::<&str>)?;
    let history = MenuItem::with_id(app, "history", "History", true, None::<&str>)?;
    let downloads = MenuItem::with_id(app, "downloads", "Downloads", true, None::<&str>)?;
    let bookmarks = MenuItem::with_id(app, "bookmarks", "Bookmarks", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, QUIT_ID, "Exit", true, None::<&str>)?;
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

// Native popup avoids being hidden behind child webviews and must run on the main thread.
#[tauri::command]
pub async fn show_browser_menu(app: AppHandle) -> Result<(), BrowserError> {
    let window = main_window(&app)?;
    let menu = build_browser_menu(&app)?;

    app.run_on_main_thread(move || {
        if let Err(err) = menu.popup(window) {
            eprintln!("[Kanso] failed to show menu: {err}");
        }
    })?;
    Ok(())
}

// Emits menu actions to the frontend, handling only exit directly here.
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