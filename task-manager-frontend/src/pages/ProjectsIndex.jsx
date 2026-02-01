import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { listProjects } from "../services/projectService";
import { ROUTES } from "../router/paths";

export default function ProjectsIndex() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await listProjects();
      return res.data ?? [];
    },
  });

  if (isLoading) return <div className="p-8">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        {/* We can add a create project dialog trigger here later */}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-500">No projects found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={ROUTES.PROJECT(project.id)}
              className="block p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{project.name}</h3>
              {project.description && (
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}