use serde::Deserialize;
use tauri::{AppHandle, Manager, State};

use crate::error::BrowserError;
use crate::layout::content_bounds;
use crate::overlay::{rebuild, OverlayState};
use crate::state::BrowserState;
use crate::tabs::{
    build_tab_webview, hide_all_tabs, main_window, parse_web_url, show_only_tab,
};

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NavigationAction {
    Back,
    Forward,
    Reload,
    Stop,
}

impl NavigationAction {
    fn script(self) -> &'static str {
        match self {
            Self::Back => "window.history.back();",
            Self::Forward => "window.history.forward();",
            Self::Reload => "window.location.reload();",
            Self::Stop => "window.stop();",
        }
    }
}

// Must be async on Windows to avoid deadlocking the main thread event loop inside `add_child`.
#[tauri::command]
pub async fn open_tab_webview(
    app: AppHandle,
    state: State<'_, BrowserState>,
    overlay: State<'_, OverlayState>,
    tab_id: String,
    url: String,
) -> Result<(), BrowserError> {
    let url = parse_web_url(&url)?;
    let window = main_window(&app)?;
    let (position, size) = content_bounds(&window)?;

    match app.get_webview(&tab_id) {
        Some(existing) => {
            existing.navigate(url)?;
            existing.set_position(position)?;
            existing.set_size(size)?;
        }
        None => {
            window.add_child(build_tab_webview(&tab_id, url), position, size)?;
            // Rebuild overlay after adding the tab so it stays on top without stealing page focus.
            rebuild(&app, &overlay)?;
        }
    }

    let tab_ids = state.activate(&tab_id)?;
    show_only_tab(&app, &tab_ids, &tab_id)
}

#[tauri::command]
pub async fn switch_tab_webview(
    app: AppHandle,
    state: State<'_, BrowserState>,
    tab_id: String,
) -> Result<(), BrowserError> {
    if let Some(webview) = app.get_webview(&tab_id) {
        let (position, size) = content_bounds(&main_window(&app)?)?;
        webview.set_position(position)?;
        webview.set_size(size)?;
    }

    let tab_ids = state.activate(&tab_id)?;
    show_only_tab(&app, &tab_ids, &tab_id)
}

#[tauri::command]
pub async fn hide_all_tab_webviews(
    app: AppHandle,
    state: State<'_, BrowserState>,
) -> Result<(), BrowserError> {
    let tab_ids = state.clear_active()?;
    hide_all_tabs(&app, &tab_ids)
}

// Frontend picks the next active tab because only it tracks "new tab" pages without a webview.
#[tauri::command]
pub async fn close_tab_webview(
    app: AppHandle,
    state: State<'_, BrowserState>,
    tab_id: String,
) -> Result<(), BrowserError> {
    if let Some(webview) = app.get_webview(&tab_id) {
        webview.close()?;
    }
    state.remove(&tab_id)
}

#[tauri::command]
pub async fn control_tab_webview(
    app: AppHandle,
    tab_id: String,
    action: NavigationAction,
) -> Result<(), BrowserError> {
    if let Some(webview) = app.get_webview(&tab_id) {
        webview.eval(action.script())?;
    }
    Ok(())
}