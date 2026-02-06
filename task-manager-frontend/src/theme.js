import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: '#7C3AED', // Electric Violet
            light: '#A78BFA',
            dark: '#5B21B6',
            contrastText: '#F8FAFC',
        },
        secondary: {
            main: '#1E293B', // Slate 800
            light: '#334155',
            dark: '#0F172A',
            contrastText: '#F8FAFC',
        },
        background: {
            default: mode === 'dark' ? '#0B0E14' : '#F8FAFC', // Deep Void vs Light
            paper: mode === 'dark' ? '#151A23' : '#FFFFFF',   // Obsidian vs White
        },
        text: {
            primary: mode === 'dark' ? '#F8FAFC' : '#0F172A',
            secondary: mode === 'dark' ? '#94A3B8' : '#64748B', // Slate 400 vs Slate 500
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
        },
        success: {
            main: '#10B981',
            light: '#34D399',
        },
        info: {
            main: '#3B82F6', // Neon Blue
            light: '#60A5FA',
        },
        divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        h1: { fontWeight: 700, letterSpacing: '-0.025em' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontWeight: 600, letterSpacing: '-0.025em' },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 12, // 0.75rem to match Tailwind config
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.75rem',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(to right, #7C3AED, #6D28D9)',
                    '&:hover': {
                        background: 'linear-gradient(to right, #6D28D9, #5B21B6)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove default MUI overlay
                    backgroundColor: mode === 'dark' ? 'rgba(21, 26, 35, 0.6) !important' : 'rgba(255, 255, 255, 0.8) !important',
                    backdropFilter: 'blur(12px)',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: mode === 'dark' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: mode === 'dark' ? '#151A23' : '#FFFFFF',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        },
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                }
            }
        }
    },
});

export default getTheme;
