import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login(token, user);
        navigate("/");
      } catch (err) {
        console.error("Failed to parse OAuth user data:", err);
        navigate("/login?error=oauth_parse_failed");
      }
    } else {
      navigate("/login?error=oauth_failed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Logging you in...</p>;
}

export default OAuthSuccess;