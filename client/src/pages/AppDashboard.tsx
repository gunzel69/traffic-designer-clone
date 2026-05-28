import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function AppDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projects, setProjects] = useState<any[]>([]);

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tgs_projects");
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      const initial = [
        {
          id: "swanston-123",
          name: "Swanston St Intersection Upgrade",
          description: "Major intersection upgrade and resurfacing works.",
          location: "Swanston St, Melbourne VIC",
          status: "review",
          updatedAt: new Date().toISOString()
        }
      ];
      setProjects(initial);
      localStorage.setItem("tgs_projects", JSON.stringify(initial));
    }
  }, []);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    const newProject = {
      id: "proj-" + Date.now(),
      name: newProjectName,
      description: "Custom traffic management project",
      location: "Melbourne, VIC",
      status: "draft",
      updatedAt: new Date().toISOString()
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem("tgs_projects", JSON.stringify(updated));
    setShowCreateDialog(false);
    setNewProjectName("");
    toast.success("Project created!");
    setLocation(`/app/editor/${newProject.id}`);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem("tgs_projects", JSON.stringify(updated));
    toast.success("Project deleted");
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="font-display text-lg font-bold text-white cursor-pointer">
                TGS AI <span className="text-orange-400">Victoria</span>
              </span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-400">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => logout()} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Projects</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your traffic guidance scheme projects</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Create New Project</h2>
              <input
                type="text"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Bourke St Lane Closure"
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white mb-6 focus:border-orange-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateProject} className="bg-orange-500 text-white">Create Project</Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-card border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all duration-200 cursor-pointer relative"
              onClick={() => setLocation(`/app/editor/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-orange-400" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
              <h3 className="font-semibold text-white text-base mb-1">{project.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {project.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
