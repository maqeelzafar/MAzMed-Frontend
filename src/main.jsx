import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import "./index.css";

// Initialize the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Wait for initialization to finish before rendering
msalInstance.initialize().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>
  );
});
