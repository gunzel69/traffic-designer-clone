import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-orange-400" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-3">404</h1>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/20">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
