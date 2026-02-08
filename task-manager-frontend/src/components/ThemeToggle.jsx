import { IconButton } from "@mui/material";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <IconButton
      onClick={toggle}
      color="primary"
      sx={{
        bgcolor: theme === 'dark' ? 'secondary.main' : 'primary.light',
        '&:hover': {
          bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'primary.main',
          color: theme === 'dark' ? 'inherit' : 'white',
        },
        border: '1px solid',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'primary.main',
        width: 40,
        height: 40,
        borderRadius: 2
      }}
    >
      {theme === "light" ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} className="text-orange-400" />
      )}
    </IconButton>
  );
}
