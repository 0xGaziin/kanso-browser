use std::mem;
use std::sync::{Mutex, MutexGuard};

use tauri::webview::WebviewBuilder;
use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, State, Webview, WebviewUrl};

use crate::error::BrowserError;
use crate::tabs::main_window;

// Must match OVERLAY_LABEL_PREFIX in src/Root.tsx.
const OVERLAY_LABEL_PREFIX: &str = "suggestions";

#[derive(Default)]
struct Inner {
    label: Option<String>,
    generation: u64,
}

// Dedicated child webview so address-bar suggestions render above tab webviews and are rebuilt on top after new tabs.
#[derive(Default)]
pub struct OverlayState {
    inner: Mutex<Inner>,
}

impl OverlayState {
    fn lock(&self) -> Result<MutexGuard<'_, Inner>, BrowserError> {
        self.inner.lock().map_err(|_| BrowserError::LockPoisoned)
    }

    fn current_label(&self) -> Result<Option<String>, BrowserError> {
        Ok(self.lock()?.label.clone())
    }

    // Increments generation to assign a fresh label and avoid close races with the prior overlay.
    fn rotate(&self) -> Result<(String, Option<String>), BrowserError> {
        let mut inner = self.lock()?;
        inner.generation += 1;
        let label = format!("{OVERLAY_LABEL_PREFIX}-{}", inner.generation);
        let previous = mem::replace(&mut inner.label, Some(label.clone()));
        Ok((label, previous))
    }
}

fn current_overlay(
    app: &AppHandle,
    state: &OverlayState,
) -> Result<Option<Webview>, BrowserError> {
    Ok(state
        .current_label()?
        .and_then(|label| app.get_webview(&label)))
}

// Adds a new hidden overlay at the top of the z-order and closes the previous one.
pub fn rebuild(app: &AppHandle, state: &OverlayState) -> Result<(), BrowserError> {
    let window = main_window(app)?;
    let (label, previous) = state.rotate()?;

    let builder = WebviewBuilder::new(label, WebviewUrl::App("index.html".into()));
    let webview = window.add_child(
        builder,
        LogicalPosition::new(0.0, 0.0),
        LogicalSize::new(1.0, 1.0),
    )?;
    webview.hide()?;

    if let Some(previous) = previous.and_then(|label| app.get_webview(&label)) {
        previous.close()?;
    }
    Ok(())
}

// Pre-creates the overlay so opening suggestions never builds a webview and steals address-bar focus.
#[tauri::command]
pub async fn init_suggestions_overlay(
    app: AppHandle,
    state: State<'_, OverlayState>,
) -> Result<(), BrowserError> {
    if current_overlay(&app, &state)?.is_some() {
        return Ok(());
    }
    rebuild(&app, &state)
}

#[tauri::command]
pub async fn show_suggestions(
    app: AppHandle,
    state: State<'_, OverlayState>,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), BrowserError> {
    if current_overlay(&app, &state)?.is_none() {
        rebuild(&app, &state)?;
    }
    let Some(overlay) = current_overlay(&app, &state)? else {
        return Ok(());
    };

    overlay.set_position(LogicalPosition::new(x, y))?;
    overlay.set_size(LogicalSize::new(width, height))?;
    overlay.show()?;
    Ok(())
}

#[tauri::command]
pub async fn hide_suggestions(
    app: AppHandle,
    state: State<'_, OverlayState>,
) -> Result<(), BrowserError> {
    if let Some(overlay) = current_overlay(&app, &state)? {
        overlay.hide()?;
    }
    Ok(())
}