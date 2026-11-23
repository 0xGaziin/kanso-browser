use tauri::{LogicalPosition, LogicalSize, Window};

use crate::error::BrowserError;

// Height of the React chrome (tab bar + toolbar), in logical pixels. Must stay aligned with `TOP_BAR_HEIGHT` in `src/store/useBrowserStore.ts`.
pub const TOP_BAR_HEIGHT: f64 = 84.0;

// Computes where tab webviews live: everything below the browser chrome. Physical pixels are converted to logical points so DPI scaling is respected.
pub fn content_bounds(
    window: &Window,
) -> Result<(LogicalPosition<f64>, LogicalSize<f64>), BrowserError> {
    let scale = window.scale_factor()?;
    let inner = window.inner_size()?;

    let width = f64::from(inner.width) / scale;
    let height = f64::from(inner.height) / scale;
    let content_height = (height - TOP_BAR_HEIGHT).max(0.0);

    Ok((
        LogicalPosition::new(0.0, TOP_BAR_HEIGHT),
        LogicalSize::new(width, content_height),
    ))
}