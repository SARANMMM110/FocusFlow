/**
 * Local Development Auth Provider
 * 
 * This provides a mock authentication system for local development
 * when Mocha credentials are not available.
 * It mimics the @getmocha/users-service/react AuthProvider interface.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  google_user_data?: {
    name?: string;
    picture?: string;
    sub?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isPending: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  redirectToLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setIsPending(false);
      }
    };

    checkSession();
  }, []);

  const signOut = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const logout = signOut;

  const redirectToLogin = async () => {
    try {
      const response = await fetch("/api/oauth/google/redirect_url");
      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error("Failed to get OAuth URL:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isPending, signOut, logout, redirectToLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within LocalAuthProvider");
  }
  return context;
}

