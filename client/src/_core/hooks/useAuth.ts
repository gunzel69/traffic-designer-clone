import { useState, useEffect } from "react";

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
    const checkAuth = async () => {
      try {
        setLoading(true);
        // DEMO MODE: Auto-login with a guest user for immediate access
        const guestUser: User = {
          id: "guest-123",
          email: "guest@tgsai.com.au",
          name: "Guest User"
        };
        
        setUser(guestUser);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(guestUser));
        localStorage.setItem("auth_token", "demo-token");
        
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
