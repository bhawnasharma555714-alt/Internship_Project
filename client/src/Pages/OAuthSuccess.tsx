// Pages/OAuthSuccess.tsx
import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent running multiple times in an infinite loop
    if (hasProcessed.current) return;

    const token = searchParams.get("token");
    const userString = searchParams.get("user");

    if (token && userString) {
      hasProcessed.current = true;
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userString));

        // 1. Store token in localStorage
        localStorage.setItem("token", token);

        // 2. Update user state in AuthContext
        updateUser(parsedUser);

        // 3. Redirect once to profile
        navigate("/profile", { replace: true });
      } catch (err) {
        console.error("Failed to parse OAuth payload:", err);
        navigate("/login", { replace: true });
      }
    } else {
      hasProcessed.current = true;
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <p className="text-lg animate-pulse">Completing authentication...</p>
    </div>
  );
}