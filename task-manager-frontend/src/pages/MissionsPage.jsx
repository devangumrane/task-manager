import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { ArrowRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import { missionService } from "../services/missionService";

export default function MissionsPage() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        missionService.getAll()
            .then(data => setMissions(data))
            .catch(err => console.error("Failed to fetch missions", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading missions database...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Active Missions</h1>
                <p className="text-muted-foreground mt-2">Select a mission to start coding.</p>
            </div>

            <div className="grid gap-4">
                {missions.map((mission) => (
                    <Card key={mission.id} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/40 transition-colors group cursor-pointer">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Code2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{mission.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{mission.difficulty}</span>
                                        <span className="text-xs text-primary font-bold">{mission.xpReward} XP</span>
                                        {mission.skill && (
                                            <span className="text-xs text-muted-foreground">• {mission.skill.name}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link to={`/missions/${mission.id}`} className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                {missions.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-muted rounded-xl">
                        <Code2 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No missions available yet</h3>
                        <p className="text-muted-foreground">Check back later or ask an admin to deploy new missions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
