import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";

const Bootstrapper = () => {
  useAuthBootstrap();
  return <App />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Bootstrapper />
      <Toaster position="top-right" />
    </BrowserRouter>
  </StrictMode>,
);
