import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../Components/Layout";
import { Eye, EyeClosed } from "lucide-react";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("No reset token provided.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      const data = err.response?.data;
      setMessage(data?.error || "Something went wrong.");
      setExpired(!!data?.expired);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Reset Password</h2>

          {!success && !expired && (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition"
                >
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-700 hover:bg-sky-600 w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {message && <p className="text-slate-400 text-sm mt-4">{message}</p>}

          {(success || expired) && (
            <div className="mt-4">
              <Link to={expired ? "/forgot-password" : "/login"} className="text-sky-500 hover:text-sky-400 font-medium">
                {expired ? "Request a new link" : "Go to Login"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ResetPassword;