import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LocalAuthProvider } from "@/react-app/lib/localAuthProvider";
import { ThemeProvider } from "@/react-app/contexts/ThemeContext";
import { ProfileProvider } from "@/react-app/contexts/ProfileContext";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LocalAuthProvider>
          <ThemeProvider>
            <ProfileProvider>
              <App />
            </ProfileProvider>
          </ThemeProvider>
        </LocalAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
