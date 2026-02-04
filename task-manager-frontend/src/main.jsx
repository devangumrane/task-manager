import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { Toaster } from "react-hot-toast";
import AuthGate from "./components/AuthGate";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <AuthGate>
            <App />
            <Toaster position="top-right" />
          </AuthGate>
        </MuiThemeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
