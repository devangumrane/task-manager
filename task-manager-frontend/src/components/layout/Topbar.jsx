import { useAuthStore } from "../../store/authStore";
import ThemeToggle from "../ThemeToggle";
import { User, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/paths";
import { motion } from "framer-motion";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-4 z-30 mx-6 mb-6 rounded-2xl glass-panel px-6 h-20 flex items-center justify-between"
    >
      {/* Left: Search / Breadcrumbs */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative group w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search tasks, projects, or people..."
            className="w-full bg-secondary/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <button className="relative p-2.5 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <Link to={ROUTES.PROFILE} className="flex items-center gap-3 pl-2 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">Pro Member</p>
          </div>

          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all duration-300">
            <User className="h-5 w-5 text-primary" />
          </div>
        </Link>
      </div>
    </motion.header>
  );
}
