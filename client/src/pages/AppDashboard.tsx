import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Plus,
  FolderOpen,
  MapPin,
  Clock,
  ChevronRight,
  Loader2,
  LogOut,
  Trash2,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function AppDashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectLocation, setNewProjectLocation] = useState("");

  const projectsQuery = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const sharedProjectsQuery = trpc.projects.sharedWithMe.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      toast.success("Project created successfully");
      setShowCreateDialog(false);
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectLocation("");
      projectsQuery.refetch();
      if (project) {
        setLocation(`/app/project/${project.id}`);
      }
    },
    onError: (err) => {
      toast.error("Failed to create project: " + err.message);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      projectsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to delete project: " + err.message);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Sign in to TGS AI Victoria</h1>
          <p className="text-gray-400 mb-6">
            Access the AI-powered traffic guidance scheme editor. Create, manage, and export compliant TGS plans.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold px-8 py-3 rounded-lg">
              Sign In to Get Started
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    createProject.mutate({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      location: newProjectLocation.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="font-display text-lg font-bold text-white">
                TGS AI <span className="text-orange-400">Victoria</span>
              </span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-400">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.name || user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Projects</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your traffic guidance scheme projects
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        {/* Create Project Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Create New Project</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g., Swanston St Lane Closure"
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Description</label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Brief description of the work..."
                    rows={3}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Location</label>
                  <input
                    type="text"
                    value={newProjectLocation}
                    onChange={(e) => setNewProjectLocation(e.target.value)}
                    placeholder="e.g., Swanston St, Melbourne VIC"
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateDialog(false)}
                  className="text-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={createProject.isPending}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
                >
                  {createProject.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projectsQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : projectsQuery.data?.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Create your first traffic guidance scheme project to get started with AI-powered TGS generation.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" /> Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsQuery.data?.map((project) => (
              <div
                key={project.id}
                className="group bg-card border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all duration-200 cursor-pointer relative"
                onClick={() => setLocation(`/app/project/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                      project.status === "approved" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      project.status === "review" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      project.status === "in_progress" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      "bg-white/5 text-gray-400 border border-white/10"
                    }`}>
                      {project.status?.replace("_", " ") || "draft"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this project?")) {
                          deleteProject.mutate({ id: project.id });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-white text-base mb-1 group-hover:text-orange-300 transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {project.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {project.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
        {/* Shared Projects */}
        {sharedProjectsQuery.data && sharedProjectsQuery.data.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Shared with You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedProjectsQuery.data.map((project: any) => (
                <div
                  key={project.id}
                  className="group bg-card border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-all duration-200 cursor-pointer relative"
                  onClick={() => setLocation(`/app/project/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {project.permission}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1 group-hover:text-blue-300 transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {project.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {project.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
