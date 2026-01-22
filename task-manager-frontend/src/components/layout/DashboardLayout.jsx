import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
