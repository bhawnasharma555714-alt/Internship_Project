// Pages/OAuthSuccess.tsx
import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // 1. Destructure login instead of updateUser
  const { login } = useAuth(); 
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get("token");
    const userString = searchParams.get("user");

    if (token && userString) {
      hasProcessed.current = true;
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userString));

        // 2. Call login() — this sets both localStorage AND React token/user state
        login(token, decodedUser);

        navigate("/profile", { replace: true });
      } catch (err) {
        console.error("Failed to parse OAuth payload:", err);
        // Fallback: Store token manually if user parse fails
        localStorage.setItem("token", token);
        navigate("/", { replace: true });
      }
    } else {
      hasProcessed.current = true;
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <p className="text-lg animate-pulse">Completing authentication...</p>
    </div>
  );
}