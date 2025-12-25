import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OperationsProvider } from "@/contexts/OperationsContext";
import { ToastContainer } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LogoSpinner } from "@/components/LogoSpinner";

// Lazy loading pages
const Login = lazy(() => import("@/pages/Login"));
const Operator = lazy(() => import("@/pages/Operator"));
const Supervisor = lazy(() => import("@/pages/Supervisor"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const App = () => (
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <OperationsProvider>
          <AppProvider>
            <ToastContainer />
            <ErrorBoundary>
              <HashRouter>
                <Suspense fallback={<LogoSpinner />}>
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/operator" element={<Operator />} />
                    <Route path="/supervisor" element={<Supervisor />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </HashRouter>
            </ErrorBoundary>
          </AppProvider>
        </OperationsProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
