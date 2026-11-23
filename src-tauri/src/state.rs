use std::sync::{Mutex, MutexGuard};

use crate::error::BrowserError;

#[derive(Default)]
struct Inner {
    // None means no native webview is active, such as when the new tab page is shown.
    active_tab_id: Option<String>,
    // Tracks only tabs backed by a native webview.
    tab_ids: Vec<String>,
}

// Single mutex keeps active tab and tracked webview IDs consistent without lock-ordering issues.
#[derive(Default)]
pub struct BrowserState {
    inner: Mutex<Inner>,
}

impl BrowserState {
    fn lock(&self) -> Result<MutexGuard<'_, Inner>, BrowserError> {
        self.inner.lock().map_err(|_| BrowserError::LockPoisoned)
    }

    pub fn activate(&self, tab_id: &str) -> Result<Vec<String>, BrowserError> {
        let mut inner = self.lock()?;
        if !inner.tab_ids.iter().any(|id| id.as_str() == tab_id) {
            inner.tab_ids.push(tab_id.to_owned());
        }
        inner.active_tab_id = Some(tab_id.to_owned());
        Ok(inner.tab_ids.clone())
    }

    pub fn clear_active(&self) -> Result<Vec<String>, BrowserError> {
        let mut inner = self.lock()?;
        inner.active_tab_id = None;
        Ok(inner.tab_ids.clone())
    }

    // Clears active_tab_id if removed so the frontend chooses the next visible tab or new tab page.
    pub fn remove(&self, tab_id: &str) -> Result<(), BrowserError> {
        let mut inner = self.lock()?;
        inner.tab_ids.retain(|id| id.as_str() != tab_id);
        if inner.active_tab_id.as_deref() == Some(tab_id) {
            inner.active_tab_id = None;
        }
        Ok(())
    }

    pub fn active_tab_id(&self) -> Result<Option<String>, BrowserError> {
        Ok(self.lock()?.active_tab_id.clone())
    }
}