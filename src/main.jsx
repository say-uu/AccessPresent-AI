import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { PresentationProvider } from "./context/PresentationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <PresentationProvider>
          <App />
        </PresentationProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);
