import { useParams } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import ProjectList from "../components/projects/ProjectList";
import CreateProjectDialog from "../components/projects/CreateProjectDialog";
import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { motion } from "framer-motion";
import Skeleton from "../components/shared/Skeleton";
import GlassCard from "../components/shared/GlassCard";

export default function ProjectsIndex() {
  const { workspaceId } = useParams();
  const { data: projects, isLoading } = useProjects(workspaceId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <GlassCard key={i} className="h-48 p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
            <Folder className="text-primary hidden md:block" size={32} />
            Projects
          </h1>
          <p className="text-muted-foreground">Manage and track your ongoing projects.</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-lg shadow-primary/25 transition-all"
        >
          <Plus size={20} /> New Project
        </motion.button>
      </div>

      <ProjectList projects={projects || []} workspaceId={workspaceId} />

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
}