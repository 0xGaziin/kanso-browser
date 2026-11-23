use std::ffi::OsString;
use std::path::{Path, PathBuf};

use serde::Serialize;
use tauri::webview::DownloadEvent;
use tauri::{AppHandle, Emitter, Manager, Webview, Wry};
use tauri_plugin_opener::OpenerExt;

use crate::error::BrowserError;

const DOWNLOAD_STARTED_EVENT: &str = "download:started";
const DOWNLOAD_FINISHED_EVENT: &str = "download:finished";

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadStartedEvent {
    path: String,
    file_name: String,
    url: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadFinishedEvent {
    path: String,
    success: bool,
}

// Appends " (1)", " (2)", etc. so existing files in the destination are never overwritten.
fn unique_path(path: PathBuf) -> PathBuf {
    if !path.exists() {
        return path;
    }

    let stem = path
        .file_stem()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "download".to_owned());
    let extension = path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy()))
        .unwrap_or_default();
    let parent = path.parent().map(Path::to_path_buf).unwrap_or_default();

    (1..)
        .map(|n| parent.join(format!("{stem} ({n}){extension}")))
        .find(|candidate| !candidate.exists())
        .expect("an unused file name always exists")
}

fn emit<S: Serialize + Clone>(app: &AppHandle, event: &str, payload: S) {
    if let Err(err) = app.emit(event, payload) {
        eprintln!("[Kanso] failed to emit {event}: {err}");
    }
}

// Routes downloads into the user's Downloads folder and notifies the frontend on start/finish.
pub fn handle_download(webview: Webview<Wry>, event: DownloadEvent<'_>) -> bool {
    let app = webview.app_handle();

    match event {
        DownloadEvent::Requested { url, destination } => {
            if let Ok(download_dir) = app.path().download_dir() {
                let file_name = destination
                    .file_name()
                    .map(|name| name.to_owned())
                    .unwrap_or_else(|| OsString::from("download"));
                *destination = unique_path(download_dir.join(file_name));
            }

            emit(
                app,
                DOWNLOAD_STARTED_EVENT,
                DownloadStartedEvent {
                    path: destination.to_string_lossy().into_owned(),
                    file_name: destination
                        .file_name()
                        .map(|n| n.to_string_lossy().into_owned())
                        .unwrap_or_default(),
                    url: url.to_string(),
                },
            );
        }
        DownloadEvent::Finished { path, success, .. } => {
            if let Some(path) = path {
                emit(
                    app,
                    DOWNLOAD_FINISHED_EVENT,
                    DownloadFinishedEvent {
                        path: path.to_string_lossy().into_owned(),
                        success,
                    },
                );
            }
        }
        _ => {}
    }

    true
}

// Ensures requested paths resolve inside Downloads to block arbitrary file access.
fn validate_download_path(app: &AppHandle, raw: &str) -> Result<PathBuf, BrowserError> {
    let download_dir = app
        .path()
        .download_dir()?
        .canonicalize()
        .map_err(|_| BrowserError::InvalidDownloadPath)?;

    let path = PathBuf::from(raw);
    let canonical = path
        .canonicalize()
        .map_err(|_| BrowserError::InvalidDownloadPath)?;

    if canonical.starts_with(&download_dir) {
        Ok(path)
    } else {
        Err(BrowserError::InvalidDownloadPath)
    }
}

#[tauri::command]
pub async fn open_download(app: AppHandle, path: String) -> Result<(), BrowserError> {
    let path = validate_download_path(&app, &path)?;
    app.opener()
        .open_path(path.to_string_lossy().into_owned(), None::<&str>)?;
    Ok(())
}

#[tauri::command]
pub async fn reveal_download(app: AppHandle, path: String) -> Result<(), BrowserError> {
    let path = validate_download_path(&app, &path)?;
    app.opener().reveal_item_in_dir(path)?;
    Ok(())
}