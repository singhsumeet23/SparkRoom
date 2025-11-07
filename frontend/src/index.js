import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./pages/App";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext"; // <-- IMPORT
// ... existing imports ...
import { ToolProvider } from "./context/ToolContext"; // <-- NEW IMPORT

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <UIProvider>
          <ToolProvider>
            {" "}
            {/* <-- WRAP APP WITH NEW PROVIDER */}
            <App />
          </ToolProvider>
        </UIProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
