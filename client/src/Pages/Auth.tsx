import { useState, type SyntheticEvent } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";


function Auth() {
  const {login} = useAuth();
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const endpoint = isSignup ? "signup" : "login";
    const reqBody = isSignup
      ? { name, email, password }
      : { email, password };

    try {
     const res = await api.post(`/auth/${endpoint}`, reqBody);
     const data = res.data;
      if (isSignup) {
        // Clear form after successful signup
        setName("");
        setEmail("");
        setPassword("");

        // Switch back to login page
        setIsSignup(false);

        // Show success message
        setError("Signup successful! Please login.");
      } else {
        login(data.token,data.user);
        setEmail("");
        setPassword("");
        navigate('/');
      }
    } catch (err: any) {
        setError(err.response?.data?.error || "Something went wrong");
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>{isSignup ? "Create Account" : "Login"}</h2>

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="example@abc.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Pwd@123"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isSignup
            ? "Sign Up"
            : "Login"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <button
        className="link-button"
        onClick={() => {
          setIsSignup(!isSignup);
          setError("");
        }}
      >
        {isSignup
          ? "Already have an account? Login"
          : "New here? Create an account"}
      </button>
    </div>
  );
}

export default Auth;

