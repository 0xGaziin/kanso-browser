use std::time::Duration;

use reqwest::{Client, Url};
use serde_json::Value;
use tauri::State;

use crate::error::BrowserError;

const REQUEST_TIMEOUT: Duration = Duration::from_millis(1500);
const MAX_SUGGESTIONS: usize = 6;
const MAX_QUERY_CHARS: usize = 100;

// Shared client reuses connections across keystrokes.
pub struct SuggestionClient(Client);

impl SuggestionClient {
    pub fn new() -> Self {
        let client = Client::builder()
            .user_agent("Kanso/0.1")
            .timeout(REQUEST_TIMEOUT)
            .build()
            .expect("failed to build the suggestions HTTP client");
        Self(client)
    }
}

// Maps engine ids to OpenSearch endpoints so the frontend cannot request arbitrary URLs.
fn endpoint(engine_id: &str) -> Option<(&'static str, &'static str)> {
    match engine_id {
        "duckduckgo" => Some(("https://duckduckgo.com/ac/?type=list", "q")),
        "google" => Some((
            "https://suggestqueries.google.com/complete/search?client=firefox",
            "q",
        )),
        "bing" => Some(("https://api.bing.com/osjson.aspx", "query")),
        "brave" => Some(("https://search.brave.com/api/suggest", "q")),
        "ecosia" => Some(("https://ac.ecosia.org/autocomplete?type=list", "q")),
        _ => None,
    }
}

fn parse_open_search(body: &str) -> Option<Vec<String>> {
    let value: Value = serde_json::from_str(body).ok()?;
    let items = value.get(1)?.as_array()?;
    Some(
        items
            .iter()
            .filter_map(Value::as_str)
            .map(str::to_owned)
            .take(MAX_SUGGESTIONS)
            .collect(),
    )
}

async fn fetch(client: &Client, engine_id: &str, query: &str) -> Option<Vec<String>> {
    let (base, param) = endpoint(engine_id)?;
    let url = Url::parse_with_params(base, &[(param, query)]).ok()?;
    let body = client
        .get(url)
        .send()
        .await
        .ok()?
        .error_for_status()
        .ok()?
        .text()
        .await
        .ok()?;
    parse_open_search(&body)
}

// Best-effort lookup: returns empty on network or parse failures instead of erroring.
#[tauri::command]
pub async fn search_suggestions(
    client: State<'_, SuggestionClient>,
    engine_id: String,
    query: String,
) -> Result<Vec<String>, BrowserError> {
    let query: String = query.trim().chars().take(MAX_QUERY_CHARS).collect();
    if query.is_empty() {
        return Ok(Vec::new());
    }
    Ok(fetch(&client.0, &engine_id, &query).await.unwrap_or_default())
}