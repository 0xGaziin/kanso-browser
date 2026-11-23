mod commands;
mod downloads;
mod error;
mod layout;
mod menu;
mod overlay;
mod state;
mod suggestions;
mod tabs;

use tauri::{Manager, WindowEvent};

use crate::overlay::OverlayState;
use crate::state::BrowserState;
use crate::suggestions::SuggestionClient;
use crate::tabs::{sync_active_webview_bounds, MAIN_WINDOW_LABEL};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(BrowserState::default())
        .manage(OverlayState::default())
        .manage(SuggestionClient::new())
        .on_menu_event(menu::handle_menu_event)
        .on_window_event(|window, event| {
            if window.label() != MAIN_WINDOW_LABEL {
                return;
            }
            if matches!(event, WindowEvent::Resized(_)) {
                if let Err(err) = sync_active_webview_bounds(window.app_handle()) {
                    eprintln!("[Kanso] resize sync error: {err}");
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_tab_webview,
            commands::switch_tab_webview,
            commands::hide_all_tab_webviews,
            commands::close_tab_webview,
            commands::control_tab_webview,
            menu::show_browser_menu,
            downloads::open_download,
            downloads::reveal_download,
            suggestions::search_suggestions,
            overlay::init_suggestions_overlay,
            overlay::show_suggestions,
            overlay::hide_suggestions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}