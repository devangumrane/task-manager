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
      className="rounded-xl border-white/10 hover:bg-white/5 hover:border-primary/50 transition-all bg-transparent"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-primary" />
      ) : (
        <Sun className="h-4 w-4 text-orange-400" />
      )}
    </Button>
  );
}
