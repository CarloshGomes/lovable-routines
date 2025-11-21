import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppProvider } from "@/contexts/AppContext";
import { ToastContainer } from "@/components/Toast";
import Login from "@/pages/Login";
import Operator from "@/pages/Operator";
import Supervisor from "@/pages/Supervisor";
import NotFound from "@/pages/NotFound";

const App = () => (
  <ThemeProvider>
    <ToastProvider>
      <AppProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/operator" element={<Operator />} />
            <Route path="/supervisor" element={<Supervisor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
