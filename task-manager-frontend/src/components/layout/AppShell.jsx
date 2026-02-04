import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Box } from "@mui/material";

export default function AppShell() {
    return (
        <Box display="flex" minHeight="100vh" bgcolor="background.default" color="text.primary">
            {/* Sidebar: Handles its own collapse state */}
            <Sidebar />

            {/* Main Content Area */}
            <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
                <Navbar />

                <Box component="main" flex={1} p={3} overflow="auto">
                    <Box maxWidth="lg" mx="auto" sx={{ animation: 'fadeIn 0.5s' }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
