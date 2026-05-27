import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Loader2, CheckCircle2, XCircle, Share2 } from "lucide-react";

export default function JoinProject() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);

  const acceptLink = trpc.shares.acceptLink.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setProjectId(data.projectId);
    },
    onError: (err) => {
      setStatus("error");
      setErrorMessage(err.message || "Failed to accept share link");
    },
  });

  useEffect(() => {
    if (isAuthenticated && token && status === "loading") {
      acceptLink.mutate({ token });
    }
  }, [isAuthenticated, token]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl(`/app/join/${token}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-white/10 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Joining Project...</h2>
            <p className="text-sm text-gray-400">Accepting the share invitation.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Successfully Joined!</h2>
            <p className="text-sm text-gray-400 mb-6">You now have access to this project.</p>
            <Button
              onClick={() => setLocation(projectId ? `/app/project/${projectId}` : "/app")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
            >
              <Share2 className="w-4 h-4 mr-2" /> Open Project
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Unable to Join</h2>
            <p className="text-sm text-gray-400 mb-6">{errorMessage}</p>
            <Button
              onClick={() => setLocation("/app")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              Go to App
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
