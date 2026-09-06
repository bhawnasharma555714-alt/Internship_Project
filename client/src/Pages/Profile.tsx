import { useEffect, useState, type SyntheticEvent } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import Layout from "../Components/Layout";
import BackButton from "../Components/BackButton";
import { User, Mail, FileText, Code, Heart, User2, Pencil, ShieldAlert } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";

function Profile() {
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState((user?.skills || []).join(", "));
  const [interests, setInterests] = useState((user?.interests || []).join(", "));
  const [editing, setEditing] = useState(false);


  // GitHub Skill Insights State
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [searchParams] = useSearchParams();
  const linked = searchParams.get("linked");
  const linkError = searchParams.get("linkError");

  // Keep state synced whenever user object changes or updates
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setSkills((user.skills || []).join(", "));
      setInterests((user.interests || []).join(", "));
      
    }
  }, [user]);

  // Fetch existing GitHub skill analysis cache if user has linked GitHub
  useEffect(() => {
    if (user?.githubId) {
      api.get("/github-skills")
        .then((res) => setAnalysis(res.data))
        .catch(() => {});
    }
  }, [user?.githubId]);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    const toastId = toast.custom(() => (
      <CustomToast type="info" title="Updating Profile" message="Your Profile is being updated" />
    ), { duration: Infinity });

    try {
      console.log(skills);
      const res = await api.patch("/users/profile", {
        
        bio,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        interests: interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      });
      toast.remove(toastId);
      toast.custom(() => (
        <CustomToast type="success" title="Profile Updated" message="Your Profile has been updated successfully" />
      ), { duration: 1800 });

      updateUser(res.data);
    } catch (err: any) {
      toast.remove(toastId);
      toast.custom(() => (
        <CustomToast type="error" title="Update Failed" message="Unable to update your profile. Please try again." />
      ), { duration: 1800 });
    } finally {
      setEditing(false); // Do NOT clear bio, skills, or interests here!
    }
  };

  const handleLinkGithub = async () => {
    try {
      const res = await api.get("/auth/github/link");
      window.location.href = res.data.url;
    } catch (err) {
      toast.custom(() => (
        <CustomToast type="error" title="Link Failed" message="Unable to start GitHub linking. Please try again." />
      ), { duration: 2000 });
    }
  };

  // Run GitHub Skill Analysis
  const handleRunAnalysis = async (force = false) => {
    setAnalyzing(true);
    const toastId = toast.custom(() => (
      <CustomToast type="info" title="Analyzing GitHub" message="Scanning commits and patch diffs..." />
    ), { duration: Infinity });

    try {
      const res = await api.get(`/github-skills/analyze${force ? "?force=true" : ""}`);
      setAnalysis(res.data.profile);
      toast.remove(toastId);
      toast.custom(() => (
        <CustomToast type="success" title="Analysis Complete" message={res.data.message} />
      ), { duration: 2000 });
    } catch (err: any) {
      toast.remove(toastId);
      toast.custom(() => (
        <CustomToast type="error" title="Analysis Failed" message={err.response?.data?.message || "Failed to analyze skills."} />
      ), { duration: 2000 });
    } finally {
      setAnalyzing(false);
    }
  };

  // Add a suggested skill into main profile skills and sync state
  const handleAddSuggestedSkill = async (skillToAdd: string) => {
    const currentSkills = user?.skills || [];
    if (currentSkills.includes(skillToAdd)) return;

    const updatedSkills = [...currentSkills, skillToAdd];

    try {
      const res = await api.patch("/users/profile", {
        skills: updatedSkills,
      });

      updateUser(res.data);

      // Update local analysis state
      if (analysis) {
        setAnalysis({
          ...analysis,
          outputSummary: {
            ...analysis.outputSummary,
            supportedSkills: [...(analysis.outputSummary?.supportedSkills || []), skillToAdd],
            suggestedSkills: (analysis.outputSummary?.suggestedSkills || []).filter((s: string) => s !== skillToAdd),
          },
        });
      }

      toast.custom(() => (
        <CustomToast type="success" title="Skill Added" message={`Added "${skillToAdd}" to your profile skills!`} />
      ), { duration: 1800 });
    } catch (err) {
      toast.custom(() => (
        <CustomToast type="error" title="Update Failed" message="Could not add skill to profile." />
      ), { duration: 1800 });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-row gap-2 mb-2 justify-center">
          <ShieldAlert className="w-12 h-12 mt-1 text-sky-600 hover:text-sky-500" />
          <h2 className="text-2xl md:text-3xl text-center text-slate-300 font-bold pt-2">Please login first!</h2>
        </div>
        <p className="mt-2 md:mt-4 text-slate-400 max-w-lg mx-auto leading-relaxed text-center">You are not authorized to visit this page please login first</p>
        <div className="flex flex-row gap-3 mb-2 justify-center mt-6">
          <Link to="/login" className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">Login/Signup</Link>
          <Link to="/projects" className="border border-sky-600 text-sky-500 hover:bg-sky-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors">Browse Projects</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BackButton />
      <div className="w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg border-4 border-slate-700 hover:border-slate-600">
        {!editing && (
          <div className="space-y-4">
            <div className="flex flex-row gap-2 mb-2 justify-center">
              <User2 className="w-8 h-8 mt-1 text-sky-600 hover:text-sky-500" />
              <h1 className="text-3xl text-white font-bold text-center mb-6">My Profile</h1>
            </div>
            <div className="border-b border-slate-600 pb-3 my-2">
              <div className="flex flex-row gap-1 mb-2">
                <User className="w-7 h-7 mt-1 text-sky-500" />
                <h2 className="text-xl md:text-2xl pl-2 font-semibold text-slate-300">{user.name}</h2>
              </div>
              <div className="flex flex-row gap-2 mb-1 mt-1 md:mt-2">
                <Mail className="w-5 h-5 mt-1 text-sky-500" />
                <p className="pl-2 text-slate-400 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-row gap-2 mb-1 mt-3">
                <FileText className="w-6 h-5 mt-1 text-sky-500" />
                <h3 className="text-lg font-semibold text-sky-500">Bio</h3>
              </div>
              <p className="pl-2 text-slate-400 font-medium">{user.bio || "No bio added"}</p>
            </div>

            <div className="mt-4">
              <div className="flex flex-row gap-2 mb-1 mt-3">
                <Code className="w-6 h-5 mt-1 text-sky-500" />
                <h3 className="text-lg font-semibold text-sky-500">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                {(user.skills || []).length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={`${skill}-${index}`} className="bg-sky-100 text-sky-900 px-3.5 py-1.5 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:cursor-pointer">{skill}</span>
                  ))
                ) : (
                  <p className="pl-2 text-slate-400 font-medium text-sm italic">No skills added yet.</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-row gap-2 mb-1 mt-3">
                <Heart className="w-6 h-5 mt-1 text-sky-500" />
                <h3 className="text-lg font-semibold text-sky-500">Interests</h3>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {(user.interests || []).length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span key={`${interest}-${index}`} className="bg-sky-100 text-sky-900 px-4 py-1.5 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:cursor-pointer">{interest}</span>
                  ))
                ) : (
                  <p className="pl-2 text-slate-400 font-medium text-sm italic">No interests added yet.</p>
                )}
              </div>
            </div>

            {/* GitHub Skill Insights Section */}
            <div className="mt-6 border-t border-slate-600 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-row gap-2">
                  <img
                    src="https://unpkg.com/simple-icons@v11/icons/github.svg"
                    alt="GitHub"
                    className="w-5 h-5 invert mt-1"
                  />
                  <h3 className="text-lg font-semibold text-sky-500">GitHub Skill Insights</h3>
                </div>
                {user.githubId && (
                  <button
                    onClick={() => handleRunAnalysis(true)}
                    disabled={analyzing}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {analyzing ? "Analyzing..." : "Re-analyze"}
                  </button>
                )}
              </div>

              {linked === "true" && (
                <p className="text-green-400 text-sm mb-3">GitHub account linked successfully!</p>
              )}
              {linkError && (
                <p className="text-red-400 text-sm mb-3">
                  {linkError === "already_linked_elsewhere"
                    ? "This GitHub account is already linked to another CollabConnect user."
                    : "Something went wrong linking your GitHub account. Please try again."}
                </p>
              )}

              {user.githubId ? (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">
                    Linked as <span className="text-slate-300 font-medium">@{user.githubUsername}</span>
                  </p>

                  {!analysis && !analyzing && (
                    <div>
                      <p className="text-slate-400 text-sm mb-3">
                        Run an analysis to verify your profile skills against your actual GitHub commits.
                      </p>
                      <button
                        onClick={() => handleRunAnalysis(false)}
                        className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Run Skill Analysis
                      </button>
                    </div>
                  )}

                  {analysis && (
                    <div className="space-y-4 bg-slate-900 p-4 rounded-xl border border-slate-700">
                      {/* 1. Supported Skills */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-1.5 flex items-center gap-1.5">
                          ✓ Supported by GitHub Commits
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.outputSummary?.supportedSkills?.length > 0 ? (
                            analysis.outputSummary.supportedSkills.map((skill: string) => (
                              <span key={skill} className="bg-green-950 text-green-300 border border-green-800 text-xs px-2.5 py-1 rounded-md font-medium">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic">No direct commit matches yet.</span>
                          )}
                        </div>
                      </div>

                      {/* 2. Claimed but no strong evidence */}
                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                          ! Claimed (No Direct Commit Match)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.outputSummary?.claimedOnlySkills?.length > 0 ? (
                            analysis.outputSummary.claimedOnlySkills.map((skill: string) => (
                              <span key={skill} className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-1 rounded-md font-medium">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic">All claimed skills are verified by commits!</span>
                          )}
                        </div>
                      </div>

                      {/* 3. Suggested Skills */}
                      <div>
                        <h4 className="text-sm font-semibold text-sky-400 mb-1.5 flex items-center gap-1.5">
                          + Suggested Skills (Found in Commits)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.outputSummary?.suggestedSkills?.length > 0 ? (
                            analysis.outputSummary.suggestedSkills.map((skill: string) => (
                              <button
                                key={skill}
                                onClick={() => handleAddSuggestedSkill(skill)}
                                className="group bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors"
                                title="Click to add to profile"
                              >
                                <span>{skill}</span>
                                <span className="text-sky-400 group-hover:text-white font-bold">+</span>
                              </button>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic">No extra unclaimed skills detected.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-slate-400 text-sm mb-3">
                    Link your GitHub account to get skill insights based on your actual contributions.
                  </p>
                  
                  <button
                    onClick={handleLinkGithub}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-950 border border-slate-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <img 
                      src="https://unpkg.com/simple-icons@v11/icons/github.svg" 
                      alt="GitHub" 
                      className="w-5 h-5 invert" 
                    />
                    Link GitHub Account
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button onClick={() => setEditing(true)} className="text-white max-w-xl px-6 py-3 mt-5 bg-sky-800 hover:bg-sky-700 transition-all duration-200 rounded-lg font-semibold">Update Profile</button>
            </div>
          </div>
        )}
        {editing && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-500">
              <div className="flex flex-row gap-1 md:gap-2 justify-center">
                <Pencil className="w-8 h-8 mt-1 text-sky-600 hover:text-sky-500" />
                <h1 className="text-2xl md:text-3xl text-white font-bold text-center pr-8">Update Profile</h1>
              </div>
              <p className="text-slate-400 font-medium text-center mt-2 mb-4">Keep your profile up to date</p>
            </div>

            <div className="mt-4">
              <label className="block text-slate-300 font-semibold mb-2">Name</label>
              <input value={user.name} disabled className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-slate-500" />
            </div>

            <div className="mt-4">
              <label className="block text-slate-300 font-semibold mb-2">Email</label>
              <input value={user.email} disabled className="w-full pl-8 md:pl-10 pr-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-slate-500" />
            </div>

            <div className="mt-4">
              <label className="block text-slate-300 font-semibold mb-2">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" className="w-full pl-8 md:pl-10 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600" />
            </div>

            <div className="mt-4">
              <label className="block text-slate-300 font-semibold mb-2">Skills<span className="text-slate-400 text-sm font-medium mt-1 pl-4">(Separate skills using commas.)</span></label>
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, MongoDB" className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600" />
            </div>

            <div className="mt-4">
              <label className="block text-slate-300 font-semibold mb-2">Interests<span className="text-slate-400 text-sm font-medium mt-1 pl-4">(Separate interests using commas.)</span></label>
              <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="AI, Web Development" className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600" />
            </div>

            <div className="mt-4 text-center">
              <button type="submit" className="bg-sky-700 text-white px-7 py-3 rounded-xl hover:bg-sky-600 transition-colors font-medium">Save Changes</button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default Profile;