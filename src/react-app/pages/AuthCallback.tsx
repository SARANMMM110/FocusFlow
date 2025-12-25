import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this is a local dev callback
        const isLocalCallback = window.location.pathname.includes('/auth/local/callback');
        
        if (isLocalCallback) {
          // Local dev mode: call the API to create a session
          const plan = searchParams.get('plan') || '';
        const registrationCode = sessionStorage.getItem('registration_code');
        
          const response = await fetch("/api/auth/local/create-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ 
              plan: plan || undefined,
              registration_code: registrationCode || undefined
            }),
          });

          if (response.ok) {
            sessionStorage.removeItem('registration_code'); // Clean up
            // Force a page reload to refresh auth state
            window.location.href = "/dashboard";
          } else {
            const error = await response.json();
            throw new Error(error.error || "Session creation failed");
          }
        } else {
          // Regular OAuth callback (for Mocha)
          const state = searchParams.get('state');
          const code = searchParams.get('code');
          const registrationCode = sessionStorage.getItem('registration_code');
          
          if (code) {
            const response = await fetch("/api/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ 
                code,
                state: state || undefined,
                registration_code: registrationCode || undefined
              }),
            });

            if (response.ok) {
              sessionStorage.removeItem('registration_code');
              window.location.href = "/dashboard";
            } else {
              throw new Error("Session creation failed");
            }
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="animate-spin mb-4">
        <Loader2 className="w-12 h-12 text-red-500" />
      </div>
      <p className="text-gray-400">Completing sign in...</p>
    </div>
  );
}
