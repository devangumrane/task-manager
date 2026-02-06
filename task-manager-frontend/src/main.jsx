import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "./components/ThemeProvider.jsx";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import getTheme from "./theme";
import { Toaster } from "react-hot-toast";
import AuthGate from "./components/AuthGate";
import { MotionConfig } from "framer-motion";
import "./index.css";

const queryClient = new QueryClient();

// Create a wrapper component to consume the theme context
const AppWrapper = () => {
  const { theme } = useTheme();

  // Memoize theme to prevent unnecessary re-renders
  const muiTheme = useMemo(() => getTheme(theme), [theme]);

  // Set background color for body based on theme manually to ensure sync
  React.useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#0B0E14' : '#F8FAFC';
  }, [theme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthGate>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: "easeOut" }}>
          <App />
        </MotionConfig>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            color: theme === 'dark' ? '#fff' : '#000',
          }
        }} />
      </AuthGate>
    </MuiThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
