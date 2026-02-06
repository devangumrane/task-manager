import { Link } from "react-router-dom";
import { Folder, ArrowRight, Calendar, ListTodo } from "lucide-react";
import GlassCard from "../shared/GlassCard";
import { ROUTES } from "../../router/paths";
import { motion } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function ProjectList({ projects = [], workspaceId, emptyMessage = "No projects found." }) {
    if (projects.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-16 border border-dashed border-white/10 rounded-2xl bg-black/20 text-muted-foreground"
            >
                <div className="p-4 rounded-full bg-white/5 mb-4 text-primary">
                    <Folder className="h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{emptyMessage}</h3>
                <p className="max-w-sm text-center">Create a new project to get started with your tasks.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {projects.map((project) => (
                <motion.div key={project.id} variants={item}>
                    <Link
                        to={ROUTES.PROJECT(workspaceId, project.id).replace(":workspaceId", workspaceId).replace(":projectId", project.id)}
                        className="group block h-full"
                    >
                        <GlassCard className="h-full flex flex-col p-0 overflow-hidden relative" hoverEffect>

                            {/* Accent Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Folder size={24} />
                                    </div>
                                    <ArrowRight size={20} className="text-muted-foreground -rotate-45 group-hover:rotate-0 group-hover:text-primary transition-all duration-300" />
                                </div>

                                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-primary transition-colors">{project.name}</h3>

                                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                                    {project.description || "No description provided for this project."}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ListTodo size={14} />
                                        <span>Tasks</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
