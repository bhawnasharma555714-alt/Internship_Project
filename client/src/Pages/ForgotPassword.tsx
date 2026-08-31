import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../Components/Layout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-3 text-center">Forgot Password</h2>
          <p className="text-slate-400 text-center mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-700 hover:bg-sky-600 w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && <p className="text-slate-400 text-sm mt-4 text-center">{message}</p>}

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sky-500 text-sm hover:text-sky-400 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ForgotPassword;