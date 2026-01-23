import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Github } from "lucide-react";
import { missionService } from "../services/missionService";

export default function MissionDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [githubLink, setGithubLink] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        missionService.getOne(id)
            .then(data => setMission(data))
            .catch(err => console.error("Failed to load mission", err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Mock submission logic for now as endpoint logic wasn't fully fleshed out in backend task
            await new Promise(r => setTimeout(r, 1000));
            // await missionService.submit(id, { submissionUrl: githubLink });
            alert("Mission Submitted for Review!");
            navigate("/missions");
        } catch (err) {
            alert("Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading mission briefings...</div>;
    if (!mission) return <div className="p-8 text-center text-destructive">Mission not found.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{mission.title}</h1>
                    <div className="flex gap-3">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs px-2 font-bold uppercase">{mission.difficulty}</span>
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs px-2 font-bold">{mission.xpReward} XP</span>
                        {mission.skill && <span className="bg-muted/50 text-muted-foreground px-2 py-1 rounded text-xs">{mission.skill.name}</span>}
                    </div>
                </div>

                <Card className="bg-card/50 backdrop-blur border-primary/10 min-h-[400px]">
                    <CardContent className="p-6 prose prose-invert max-w-none">
                        <pre className="font-sans whitespace-pre-wrap">{mission.description}</pre>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Action & Submission */}
            <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur border-primary/10">
                    <CardHeader>
                        <CardTitle>Submission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">GitHub PR Link</label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://github.com/..."
                                        className="w-full bg-muted border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={githubLink}
                                        onChange={(e) => setGithubLink(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit Mission"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {mission.objectives && (
                    <Card className="bg-card/50 backdrop-blur border-primary/10">
                        <CardHeader>
                            <CardTitle>Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mission.objectives.map((obj, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full border border-primary/50 flex items-center justify-center">
                                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                        </div>
                                        <span className="text-sm text-foreground">{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
