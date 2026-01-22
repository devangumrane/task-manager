import { useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-muted transition"
      >
        <Bell size={18} />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-popover border rounded-md shadow z-50 p-4 text-sm"
          >
            <h4 className="font-medium mb-2">Notifications</h4>
            <p className="text-muted-foreground text-xs">No notifications yet.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
