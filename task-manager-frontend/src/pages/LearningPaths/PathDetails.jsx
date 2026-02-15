import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLearningPaths } from '../../services/learningPathService'; // In real app, might want getLearningPathById
import GlassCard from '../../components/shared/GlassCard';
import { ArrowLeft, CheckCircle, Circle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PathDetails() {
    const { pathId } = useParams();
    const navigate = useNavigate();

    // optimizing: just filtering from all paths for now to save backend work, 
    // but typically would be api.get(/learning-paths/:id)
    const { data, isLoading } = useQuery({
        queryKey: ['learning-paths'],
        queryFn: getLearningPaths,
    });

    const path = data?.data?.data?.find(p => p.id === parseInt(pathId));

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading path details...</div>;
    if (!path) return <div className="p-8 text-center text-red-400">Path not found</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            >
                <ArrowLeft size={16} /> Back to Paths
            </button>

            <GlassCard className="p-8 border-primary/20 bg-primary/5">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{path.title}</h1>
                        <p className="text-lg text-muted-foreground">{path.description}</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {path.progress || 0}%
                    </div>
                </div>
            </GlassCard>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Milestones</h2>
                {path.milestones?.map((milestone, index) => (
                    <MilestoneItem key={milestone.id} milestone={milestone} index={index} />
                ))}
            </div>
        </div>
    );
}

function MilestoneItem({ milestone, index }) {
    const isLocked = false; // logic for locking could be added here (e.g. previous must be done)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <GlassCard className={`p-6 ${milestone.isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                <div className="flex gap-4">
                    <div className="mt-1">
                        {milestone.isCompleted ? (
                            <CheckCircle className="text-emerald-500" size={24} />
                        ) : isLocked ? (
                            <Lock className="text-muted-foreground" size={24} />
                        ) : (
                            <Circle className="text-primary" size={24} />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {milestone.title}
                            {milestone.isCompleted && <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">Completed</span>}
                        </h3>
                        <p className="text-muted-foreground mb-4">{milestone.description}</p>

                        <div className="space-y-3">
                            {milestone.requirements?.map(req => (
                                <div key={req.id} className="flex justify-between items-center bg-black/20 p-2 rounded px-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${req.isMet ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                        <span className="text-sm font-medium">{req.skill.name}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {Math.min(req.userProgress, req.targetTaskCount)} / {req.targetTaskCount} Tasks
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
