import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../Components/Layout";

type Status = "verifying" | "success" | "expired" | "error";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided.");
        return;
      }
      try {
        const res = await api.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
      } catch (err: any) {
        const data = err.response?.data;
        if (data?.expired) {
          setStatus("expired");
          setMessage(data.error || "This verification link has expired.");
        } else {
          setStatus("error");
          setMessage(data?.error || "Verification failed.");
        }
      }
    };
    verify();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);
    setResendMessage("");
    try {
      const res = await api.post("/auth/resend-verification", { email: resendEmail });
      setResendMessage(res.data.message);
    } catch {
      setResendMessage("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center">
          {status === "verifying" && (
            <p className="text-slate-300">Verifying your email...</p>
          )}

          {status === "success" && (
            <>
              <h2 className="text-2xl font-bold text-white mb-3">Email Verified</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              <Link to="/login" className="text-sky-500 hover:text-sky-400 font-medium">
                Go to Login
              </Link>
            </>
          )}

          {(status === "expired" || status === "error") && (
            <>
              <h2 className="text-2xl font-bold text-white mb-3">
                {status === "expired" ? "Link Expired" : "Verification Failed"}
              </h2>
              <p className="text-slate-400 mb-6">{message}</p>

              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="bg-sky-700 hover:bg-sky-600 w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-60"
                >
                  {resendLoading ? "Sending..." : "Resend Verification Email"}
                </button>
              </form>

              {resendMessage && (
                <p className="text-slate-400 text-sm mt-4">{resendMessage}</p>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default VerifyEmail;