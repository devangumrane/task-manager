import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppShell() {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar: Handles its own collapse state */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
