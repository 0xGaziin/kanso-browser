import React from "react";
import ReactDOM from "react-dom/client";
import { Root } from "./Root";
import "./App.css";

import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();
let isTogglingFullscreen = false;

window.addEventListener("keydown", async (event) => {
  if (event.key !== "F11" || event.repeat || isTogglingFullscreen) {
    return;
  }

  event.preventDefault();
  isTogglingFullscreen = true;

  try {
    const isFull = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!isFull);
  } finally {
    isTogglingFullscreen = false;
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);