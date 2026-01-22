import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import { Toaster } from "react-hot-toast";
import AuthGate from "./components/AuthGate";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthGate>
          <App />
          <Toaster position="top-right" />
        </AuthGate>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
