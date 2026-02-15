import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLearningPaths } from '../../services/learningPathService';
import GlassCard from '../../components/shared/GlassCard';
import { BookOpen, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PathList() {
    const { data, isLoading } = useQuery({
        queryKey: ['learning-paths'],
        queryFn: getLearningPaths,
    });

    const paths = data?.data?.data || [];

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading learning paths...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Learning Paths</h1>
                    <p className="text-muted-foreground">Structured professional milestones to master your craft.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paths.map((path) => (
                    <PathCard key={path.id} path={path} />
                ))}
                {paths.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-white/10">
                        No learning paths available yet. Ask your admin to assign one.
                    </div>
                )}
            </div>
        </div>
    );
}

function PathCard({ path }) {
    return (
        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <GlassCard className="h-full flex flex-col p-6 cursor-pointer hover:border-primary/50 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors`}>
                        <BookOpen size={24} />
                    </div>
                    {path.progress >= 100 && (
                        <div className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
                            <CheckCircle size={12} />
                            COMPLETED
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{path.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">
                    {path.description}
                </p>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{path.progress || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${path.progress || 0}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                        {path.milestones?.filter(m => m.isCompleted).length || 0} / {path.milestones?.length || 0} Milestones
                    </p>
                </div>
            </GlassCard>
        </motion.div>
    );
}
