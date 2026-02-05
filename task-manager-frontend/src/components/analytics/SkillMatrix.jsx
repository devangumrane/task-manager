import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { api } from '../../api/axios';

export default function SkillMatrix() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await api.get('/analytics/my-skills');
                setSkills(res.data.data);
            } catch (error) {
                console.error("Failed to fetch skills", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    if (loading) return <Typography>Loading skills...</Typography>;
    if (skills.length === 0) return <Typography color="text.secondary">No skills recorded yet. Complete tasks tagged with skills to build your profile.</Typography>;

    // Max tasks completed for scaling (simple scaling)
    const maxTasks = Math.max(...skills.map(s => s.tasks_completed), 1);

    return (
        <Card variant="outlined">
            <CardHeader title="Professional Competencies" />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    {skills.map((userSkill) => (
                        <Box key={userSkill.skill_id}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="body2" fontWeight="medium">
                                    {userSkill.skill.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {userSkill.tasks_completed} tasks
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(userSkill.tasks_completed / maxTasks) * 100}
                                sx={{ height: 8, borderRadius: 1 }}
                            />
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}
