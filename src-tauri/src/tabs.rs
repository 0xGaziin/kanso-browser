use serde::Serialize;
use tauri::webview::{PageLoadEvent, WebviewBuilder};
use tauri::{AppHandle, Emitter, Manager, Url, WebviewUrl, Window, Wry};

use crate::downloads::handle_download;
use crate::error::BrowserError;
use crate::layout::content_bounds;
use crate::state::BrowserState;

pub const MAIN_WINDOW_LABEL: &str = "main";
const TAB_LOAD_EVENT: &str = "tab:load";
const TAB_TITLE_EVENT: &str = "tab:title";

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TabLoadEvent {
    tab_id: String,
    url: String,
    is_loading: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TabTitleEvent {
    tab_id: String,
    title: String,
}

pub fn main_window(app: &AppHandle) -> Result<Window, BrowserError> {
    app.get_window(MAIN_WINDOW_LABEL)
        .ok_or(BrowserError::MainWindowNotFound)
}

fn is_allowed_scheme(url: &Url) -> bool {
    matches!(url.scheme(), "http" | "https")
}

// Allows only http and https schemes.
pub fn parse_web_url(raw: &str) -> Result<Url, BrowserError> {
    let url = Url::parse(raw).map_err(|e| BrowserError::InvalidUrl(e.to_string()))?;
    if !is_allowed_scheme(&url) {
        return Err(BrowserError::UnsupportedScheme(url.scheme().to_owned()));
    }
    Ok(url)
}

// Applies the same scheme guard to links and redirects as to address-bar URLs.
fn allow_navigation(url: &Url) -> bool {
    is_allowed_scheme(url) || url.as_str() == "about:blank"
}

pub fn build_tab_webview(tab_id: &str, url: Url) -> WebviewBuilder<Wry> {
    let load_tab_id = tab_id.to_owned();
    let title_tab_id = tab_id.to_owned();

    WebviewBuilder::new(tab_id, WebviewUrl::External(url))
        .on_navigation(allow_navigation)
        .on_download(handle_download)
        .on_page_load(move |webview, payload| {
            let event = TabLoadEvent {
                tab_id: load_tab_id.clone(),
                url: payload.url().to_string(),
                is_loading: matches!(payload.event(), PageLoadEvent::Started),
            };
            if let Err(err) = webview.app_handle().emit(TAB_LOAD_EVENT, event) {
                eprintln!("[Kanso] failed to emit {TAB_LOAD_EVENT}: {err}");
            }
        })
        .on_document_title_changed(move |webview, title| {
            let event = TabTitleEvent {
                tab_id: title_tab_id.clone(),
                title,
            };
            if let Err(err) = webview.app_handle().emit(TAB_TITLE_EVENT, event) {
                eprintln!("[Kanso] failed to emit {TAB_TITLE_EVENT}: {err}");
            }
        })
}

pub fn show_only_tab(
    app: &AppHandle,
    tab_ids: &[String],
    active_id: &str,
) -> Result<(), BrowserError> {
    for id in tab_ids {
        let Some(webview) = app.get_webview(id) else {
            continue;
        };
        if id == active_id {
            webview.show()?;
            webview.set_focus()?;
        } else {
            webview.hide()?;
        }
    }
    Ok(())
}

// Restores focus to the main webview when tab webviews are hidden so the React UI can receive keys.
pub fn hide_all_tabs(app: &AppHandle, tab_ids: &[String]) -> Result<(), BrowserError> {
    for id in tab_ids {
        if let Some(webview) = app.get_webview(id) {
            webview.hide()?;
        }
    }
    if let Some(main_webview) = app.get_webview(MAIN_WINDOW_LABEL) {
        main_webview.set_focus()?;
    }
    Ok(())
}

pub fn sync_active_webview_bounds(app: &AppHandle) -> Result<(), BrowserError> {
    let state = app.state::<BrowserState>();
    let Some(tab_id) = state.active_tab_id()? else {
        return Ok(());
    };
    let Some(webview) = app.get_webview(&tab_id) else {
        return Ok(());
    };

    let (position, size) = content_bounds(&main_window(app)?)?;
    webview.set_position(position)?;
    webview.set_size(size)?;
    Ok(())
}