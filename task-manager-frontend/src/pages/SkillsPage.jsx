import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Brain, Lock, CheckCircle2 } from "lucide-react";

const skills = [
    { id: 1, name: "Backend Fundamentals", level: "Beginner", status: "unlocked", progress: 60 },
    { id: 2, name: "Database Design", level: "Intermediate", status: "locked", progress: 0 },
    { id: 3, name: "API Security", level: "Advanced", status: "locked", progress: 0 },
];

export default function SkillsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Skill Tree</h1>
                <p className="text-muted-foreground mt-2">Master these technologies to advance your engineering career.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill) => (
                    <Card key={skill.id} className={`bg-card/50 backdrop-blur border-primary/10 ${skill.status === "locked" ? "opacity-60 grayscale" : ""}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold">{skill.name}</CardTitle>
                            {skill.status === "locked" ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Brain className="w-5 h-5 text-primary" />}
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-muted-foreground">{skill.level}</span>
                                <span className="font-bold text-primary">{skill.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${skill.progress}%` }}
                                />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs text-muted-foreground">3 Missions Available</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
