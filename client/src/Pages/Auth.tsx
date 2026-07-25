import { useState, type SyntheticEvent } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Layout from "../Components/Layout";
import Error from "../Components/Error"
import { SmilePlus, Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";
function Auth() {
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
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
        setName("");
        setEmail("");
        setPassword("");
        setIsSignup(false);
        toast.custom(()=>(
            <CustomToast type="success" title="Signup Successful" message="Your signup was successful. Please Login."/>
          ),{duration:1500})
        navigate('/login');
      } else {
          login(data.token, data.user);
          toast.custom(()=>(
            <CustomToast type="success" title="Login Successful" message="Your have logged in successfully."/>
          ),{duration:1500})
          setEmail("");
          setPassword("");
          navigate("/");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Something went wrong");
        toast.custom(()=>(
          <CustomToast type="error" title="Login Failed" message="Unable to login"/>
        ),{duration:1500})
      } finally {
        setLoading(false);
      }
  };

  if(error === "Something went wrong") return <Error className="h-80 w-80" error={error}/>

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="border-b border-slate-500 mb-4">
            <div className="flex flex-row justify-center my-2">
              <SmilePlus className="w-8 h-8 text-sky-500 mt-1"/>
              <h2 className="text-3xl pl-2 pr-4 font-bold text-center text-white">{isSignup ? "Create Account" : "Welcome Back"}</h2>
            </div>
            <p className="text-slate-400 font-medium text:sm text-center mt-2 mb-3">{isSignup? "Join CollabConnect and start collaborating.": "Login to continue building amazing projects."}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-6 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full pl-6 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition">
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

           <div className="flex justify-center">
             <button
              type="submit"
              disabled={loading}
              className="bg-sky-700 hover:bg-sky-600 max-w-xl px-6 transition-colors text-white font-semibold py-3 rounded-lg disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>
           </div>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-sky-500 hover:text-sky-400 transition-colors font-medium"
            >
              {isSignup
                ? "Already have an account? Login"
                : "New here? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Auth;