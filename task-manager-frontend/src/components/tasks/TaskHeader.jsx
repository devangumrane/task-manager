import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "../../router/paths";

export default function TaskHeader({ workspaceId, projectId, task }) {
    const navigate = useNavigate();

    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <button
                onClick={() => navigate(ROUTES.TASK(workspaceId, projectId, task.id).replace('tasks/' + task.id, ''))}
                className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <span className="text-muted-foreground">/</span>
            <button className="text-muted-foreground hover:text-white transition-colors">Projects</button>
            <span className="text-muted-foreground">/</span>
            <span className="text-white font-medium truncate max-w-md">{task.title}</span>
        </motion.div>
    );
}
