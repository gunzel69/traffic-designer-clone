import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  Plus,
  ArrowLeft,
  FileText,
  Shield,
  Clock,
  ChevronRight,
  Loader2,
  LogOut,
  Trash2,
  MapPin,
  Brain,
  Edit,
  Share2,
  Users,
  LinkIcon,
  Copy,
  History,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState<number | null>(null);
  const [newPlanName, setNewPlanName] = useState("");
  const [newWorkType, setNewWorkType] = useState("lane_closure");
  const [newSpeedZone, setNewSpeedZone] = useState(60);
  const [newLaneCount, setNewLaneCount] = useState(2);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "edit">("view");

  const projectQuery = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const plansQuery = trpc.plans.list.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const sharesQuery = trpc.shares.list.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const createPlan = trpc.plans.create.useMutation({
    onSuccess: (plan) => {
      toast.success("TGS Plan created");
      setShowCreatePlan(false);
      setNewPlanName("");
      plansQuery.refetch();
      if (plan) {
        setLocation(`/app/editor/${plan.id}`);
      }
    },
    onError: (err) => {
      toast.error("Failed to create plan: " + err.message);
    },
  });

  const deletePlan = trpc.plans.delete.useMutation({
    onSuccess: () => {
      toast.success("Plan deleted");
      plansQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to delete plan: " + err.message);
    },
  });

  const createShare = trpc.shares.create.useMutation({
    onSuccess: () => {
      toast.success("Project shared successfully");
      setShareEmail("");
      sharesQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to share: " + err.message);
    },
  });

  const removeShare = trpc.shares.remove.useMutation({
    onSuccess: () => {
      toast.success("Access removed");
      sharesQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to remove access: " + err.message);
    },
  });

  const generateLink = trpc.shares.generateLink.useMutation({
    onSuccess: (data) => {
      const link = `${window.location.origin}/app/join/${data.token}`;
      navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard! Valid for 7 days.");
    },
    onError: (err) => {
      toast.error("Failed to generate link: " + err.message);
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
    window.location.href = getLoginUrl();
    return null;
  }

  const project = projectQuery.data;

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
            <Link href="/app">
              <span className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-300">{project?.name || "..."}</span>
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
        {/* Back button */}
        <Link href="/app">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Button>
        </Link>

        {projectQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : !project ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-white mb-2">Project not found</h3>
            <Link href="/app">
              <Button variant="outline" className="border-gray-700 text-gray-300">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Project Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {project.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {project.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  className="border-gray-700 text-gray-300 hover:text-white hover:border-orange-500/30"
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button
                  onClick={() => setShowCreatePlan(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" /> New TGS Plan
                </Button>
              </div>
            </div>

            {/* Create Plan Dialog */}
            {showCreatePlan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                  <h2 className="text-lg font-bold text-white mb-4">Create TGS Plan</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Plan Name *</label>
                      <input
                        type="text"
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        placeholder="e.g., Stage 1 - Northbound Lane Closure"
                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Work Type</label>
                      <select
                        value={newWorkType}
                        onChange={(e) => setNewWorkType(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                      >
                        <option value="lane_closure">Lane Closure</option>
                        <option value="road_closure">Road Closure</option>
                        <option value="shoulder_closure">Shoulder Closure</option>
                        <option value="intersection_work">Intersection Work</option>
                        <option value="pedestrian_detour">Pedestrian Detour</option>
                        <option value="multi_lane_closure">Multi-Lane Closure</option>
                        <option value="night_works">Night Works</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Speed Zone (km/h)</label>
                        <select
                          value={newSpeedZone}
                          onChange={(e) => setNewSpeedZone(Number(e.target.value))}
                          className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                        >
                          <option value={40}>40 km/h</option>
                          <option value={50}>50 km/h</option>
                          <option value={60}>60 km/h</option>
                          <option value={70}>70 km/h</option>
                          <option value={80}>80 km/h</option>
                          <option value={100}>100 km/h</option>
                          <option value={110}>110 km/h</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Lane Count</label>
                        <select
                          value={newLaneCount}
                          onChange={(e) => setNewLaneCount(Number(e.target.value))}
                          className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                        >
                          <option value={1}>1 Lane</option>
                          <option value={2}>2 Lanes</option>
                          <option value={3}>3 Lanes</option>
                          <option value={4}>4 Lanes</option>
                          <option value={5}>5+ Lanes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="ghost"
                      onClick={() => setShowCreatePlan(false)}
                      className="text-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!newPlanName.trim()) {
                          toast.error("Please enter a plan name");
                          return;
                        }
                        createPlan.mutate({
                          projectId,
                          name: newPlanName.trim(),
                          workType: newWorkType as any,
                          speedZone: newSpeedZone,
                          laneCount: newLaneCount,
                        });
                      }}
                      disabled={createPlan.isPending}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
                    >
                      {createPlan.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Create Plan
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Share Dialog */}
            {showShareDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-orange-400" /> Share Project
                    </h2>
                    <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Share by email */}
                  <div className="space-y-3 mb-5">
                    <label className="text-sm text-gray-400 block">Invite by email</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                      />
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value as "view" | "edit")}
                        className="bg-background border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                      </select>
                    </div>
                    <Button
                      onClick={() => {
                        if (!shareEmail.trim() || !shareEmail.includes("@")) {
                          toast.error("Please enter a valid email");
                          return;
                        }
                        createShare.mutate({
                          projectId,
                          sharedWithEmail: shareEmail.trim(),
                          permission: sharePermission,
                        });
                      }}
                      disabled={createShare.isPending}
                      size="sm"
                      className="w-full bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                    >
                      {createShare.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                      Send Invite
                    </Button>
                  </div>

                  {/* Generate share link */}
                  <div className="border-t border-white/10 pt-4 mb-5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateLink.mutate({ projectId })}
                      disabled={generateLink.isPending}
                      className="w-full border-gray-700 text-gray-300 hover:text-white"
                    >
                      {generateLink.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                      Generate Share Link (7 days)
                    </Button>
                  </div>

                  {/* Current shares */}
                  {sharesQuery.data && sharesQuery.data.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">People with access</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sharesQuery.data.map((share: any) => (
                          <div key={share.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2">
                            <div>
                              <div className="text-sm text-white">{share.sharedWithEmail}</div>
                              <div className="text-[10px] text-gray-500 capitalize">{share.permission} access</div>
                            </div>
                            <button
                              onClick={() => removeShare.mutate({ shareId: share.id })}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Revision History Dialog */}
            {showRevisionHistory && selectedPlanForHistory && (
              <RevisionHistoryDialog
                planId={selectedPlanForHistory}
                onClose={() => {
                  setShowRevisionHistory(false);
                  setSelectedPlanForHistory(null);
                }}
              />
            )}

            {/* Plans List */}
            {plansQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
              </div>
            ) : plansQuery.data?.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-gray-500" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">No TGS plans yet</h3>
                <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
                  Create a TGS plan to start designing traffic guidance schemes with AI assistance.
                </p>
                <Button
                  onClick={() => setShowCreatePlan(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create First Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {plansQuery.data?.map((plan) => (
                  <div
                    key={plan.id}
                    className="group bg-card border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all duration-200 cursor-pointer flex items-center gap-4"
                    onClick={() => setLocation(`/app/editor/${plan.id}`)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm group-hover:text-orange-300 transition-colors truncate">
                          {plan.name}
                        </h3>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                          plan.complianceStatus === "compliant" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          plan.complianceStatus === "non_compliant" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          plan.complianceStatus === "warnings" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                          "bg-white/5 text-gray-400 border border-white/10"
                        }`}>
                          {plan.complianceStatus === "compliant" ? "Compliant" :
                           plan.complianceStatus === "non_compliant" ? "Non-Compliant" :
                           plan.complianceStatus === "warnings" ? "Warnings" : "Unchecked"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{plan.workType?.replace(/_/g, " ")}</span>
                        <span>{plan.speedZone} km/h</span>
                        <span>{plan.laneCount} lanes</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(plan.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanForHistory(plan.id);
                          setShowRevisionHistory(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-blue-500/10 transition-all"
                        title="Revision History"
                      >
                        <History className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this plan?")) {
                            deletePlan.mutate({ id: plan.id });
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Revision History Dialog Component
function RevisionHistoryDialog({ planId, onClose }: { planId: number; onClose: () => void }) {
  const revisionsQuery = trpc.revisions.list.useQuery({ planId });
  const restoreRevision = trpc.revisions.restore.useMutation({
    onSuccess: () => {
      toast.success("Revision restored successfully");
      onClose();
    },
    onError: (err) => {
      toast.error("Failed to restore: " + err.message);
    },
  });

  const createRevision = trpc.revisions.create.useMutation({
    onSuccess: () => {
      toast.success("Revision saved");
      revisionsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to save revision: " + err.message);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" /> Revision History
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => createRevision.mutate({ planId })}
              disabled={createRevision.isPending}
              className="border-gray-700 text-gray-300 hover:text-white text-xs"
            >
              {createRevision.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
              Save Current
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {revisionsQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            </div>
          ) : !revisionsQuery.data || revisionsQuery.data.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No revisions yet.</p>
              <p className="text-xs text-gray-500 mt-1">Revisions are created automatically when you generate a TGS plan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {revisionsQuery.data.map((revision: any, index: number) => (
                <div
                  key={revision.id}
                  className="bg-background border border-white/10 rounded-lg p-4 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400">v{revisionsQuery.data!.length - index}</span>
                        {index === 0 && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">Latest</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-1 truncate">{revision.description || "No description"}</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {new Date(revision.createdAt).toLocaleString("en-AU")}
                      </p>
                    </div>
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Restore this revision? Current state will be saved first.")) {
                            restoreRevision.mutate({ revisionId: revision.id });
                          }
                        }}
                        disabled={restoreRevision.isPending}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
