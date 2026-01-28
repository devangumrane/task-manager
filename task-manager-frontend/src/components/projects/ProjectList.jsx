import { Link } from "react-router-dom";
import { Folder, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ROUTES } from "../../router/paths";

export default function ProjectList({ projects = [], workspaceId, emptyMessage = "No projects found." }) {
    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                <Folder className="h-10 w-10 mb-4 opacity-50" />
                <h3 className="text-lg font-medium">{emptyMessage}</h3>
                <p className="mb-4">Create a new project to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Link
                    key={project.id}
                    to={ROUTES.PROJECT(workspaceId, project.id).replace(":workspaceId", workspaceId).replace(":projectId", project.id)}
                    className="group"
                >
                    <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Folder className="h-5 w-5 fill-current opacity-20" />
                                {project.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.description || "No description"}
                            </p>
                            <div className="mt-4 text-xs text-muted-foreground">
                                Created {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
