import { useAuthStore } from "../../store/authStore";
import ThemeToggle from "../ThemeToggle";
import { LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/paths";

export default function Navbar() {
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const handleLogout = () => {
        clearAuth();
        window.location.href = "/login";
    };

    return (
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                {/* Placeholder for Breadcrumbs or Page Title */}
                <h2 className="font-semibold text-lg">Task Manager</h2>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />

                <div className="flex items-center gap-3 pl-4 border-l">
                    <Link to={ROUTES.PROFILE} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>

                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                    </Link>

                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
