import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      className={`
        rounded-xl transition-all duration-300
        ${theme === 'dark'
          ? 'bg-secondary hover:bg-white/10 border-white/10'
          : 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm'
        }
      `}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-primary" />
      ) : (
        <Sun className="h-4 w-4 text-orange-400" />
      )}
    </Button>
  );
}
