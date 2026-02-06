import { useOutlet, useLocation } from "react-router-dom";
import NavSidebar from "./NavSidebar";
import TopBar from "./TopBar";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function AppShell() {
    const location = useLocation();
    const currentOutlet = useOutlet();

    // Simplified sidebar state (future: move to global store)
    const [collapsed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("sidebar-collapsed")) || false;
        } catch {
            return false;
        }
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/30 overflow-hidden">
            {/* Sidebar */}
            <div className="z-40">
                <NavSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ml-[80px] lg:ml-[280px] h-screen overflow-hidden">
                <TopBar />

                <main className="flex-1 px-6 pb-6 overflow-x-hidden overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="h-full"
                            >
                                {currentOutlet}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
