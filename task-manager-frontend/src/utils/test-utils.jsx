/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../components/ThemeProvider';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';

// Create a wrapper that matches AppWrapper's theme logic
const TestProviders = ({ children }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Disable retries for tests
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <ThemeProvider>
                    <ThemeConsumer>
                        {children}
                    </ThemeConsumer>
                </ThemeProvider>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

// Helper to consume theme context and render MUI provider
const ThemeConsumer = ({ children }) => {
    const { theme } = useTheme();
    const muiTheme = useMemo(() => getTheme(theme), [theme]);

    return (
        <MuiThemeProvider theme={muiTheme}>
            {children}
        </MuiThemeProvider>
    );
};

const customRender = (ui, options) =>
    render(ui, { wrapper: TestProviders, ...options });

// re-export everything
export * from '@testing-library/react';
export { customRender as render };
