use serde::{Serialize, Serializer};

// Errors returned by browser commands. Serialized as a plain string so the frontend receives a readable message in the rejected `invoke` promise.
#[derive(Debug, thiserror::Error)]
pub enum BrowserError {
    #[error("main window not found")]
    MainWindowNotFound,

    #[error("invalid URL: {0}")]
    InvalidUrl(String),

    #[error("unsupported URL scheme: {0}")]
    UnsupportedScheme(String),

    #[error("invalid download path")]
    InvalidDownloadPath,

    #[error("browser state lock poisoned")]
    LockPoisoned,

    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error(transparent)]
    Opener(#[from] tauri_plugin_opener::Error),
}

impl Serialize for BrowserError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}