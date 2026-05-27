import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        setLoading(true);
        // In a real app, this would call an API endpoint to check auth status
        // For now, we'll use a simple check based on localStorage or cookies
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (e) {
            setError("Failed to parse user data");
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth check failed");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    // Redirect to login
    window.location.href = "/";
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    logout,
  };
}
