# Kanso

A minimalist desktop web browser for Windows focused on privacy, directness, and low overhead. Built with Tauri v2, React, and Rust.

## How it works

Kanso splits the interface and actual page rendering across native Windows WebView2 instances coordinated by a Rust backend. A React frontend manages the browser chrome, state stores, and IPC calls through `browserApi`, while webviews are positioned and hidden dynamically as tabs change or internal views open.

Internal pages such as `kanso://newtab`, `kanso://history`, `kanso://downloads`, `kanso://bookmarks`, and `kanso://settings` run inside the React app and hide native webviews when active. Address bar input resolves directly to URLs, local hosts, or configured search engines without routing queries through third-party suggestion proxies unless explicitly enabled, and favicons are fetched straight from the site origin when available.

The omnibox suggestions overlay is mounted as a separate Tauri webview identified by label so the overlay bundle stays isolated from the main browser stores and resizes to fit its rows.

## Stack

- **Desktop & native shell:** Rust, Tauri v2, WebView2
- **Frontend:** React, TypeScript, Zustand

## Running locally

Install frontend dependencies and start the Tauri development environment from the repository root:

```bash
npm install
npm run tauri dev

# To build a production bundle:
npm run tauri build
```

Requires Rust, Node.js, and the Microsoft Edge WebView2 runtime on Windows.