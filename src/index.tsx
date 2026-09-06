import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import App from "./app";
import { initAnalytics } from "./lib/analytics";
import "./index.css";

initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary
        fallback={
          <div style={{ padding: 48, textAlign: "center", color: "#5c3d2e" }}>
            页面出错了，请刷新重试
          </div>
        }
      >
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
