import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, UserPlus, RefreshCw, Users, ShieldCheck } from "lucide-react";
import api from "../services/api";

interface Member {
  id: string;
  name: string;
  role: string;
  skills: string[];
}

interface SkillGapData {
  readinessScore: number;
  coveredSkills: string[];
  missingSkills: string[];
  recommendedRolesToHire: string[];
  insights: string;
}

interface Props {
  projectId: string;
}

export default function SkillGapSidebar({ projectId }: Props) {
  const [data, setData] = useState<SkillGapData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/projects/${projectId}/skill-gap`);
      setData(res.data.analysis);
      setMembers(res.data.members || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load skill-gap analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchAnalysis();
  }, [projectId]);

  return (
    <div className="w-full lg:w-80 bg-[#131A29] border border-slate-800 rounded-2xl p-5 flex flex-col h-full overflow-y-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-base">Team Skill-Gap</h3>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Re-analyze Team"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
        </button>
      </div>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3 text-xs">
          <Sparkles className="w-6 h-6 animate-spin text-purple-400" />
          <span>Analyzing team dynamics...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/50 border border-red-800/50 text-red-300 p-3 rounded-xl text-xs mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-5 text-xs">
          {/* Readiness Gauge */}
          <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
              Project Readiness Score
            </span>
            <div className="text-3xl font-extrabold text-sky-400 my-1">{data.readinessScore}%</div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.readinessScore}%` }}
              />
            </div>
          </div>

          {/* Current Team & Assigned Roles Section */}
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-sky-400" /> Active Team Roles ({members.length})
            </span>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="bg-[#0B0F17] border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-slate-200 font-semibold truncate text-xs">{m.name}</p>
                    <p className="text-[11px] text-purple-300 font-medium truncate flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0" />
                      {m.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-purple-950/30 border border-purple-800/30 p-3 rounded-xl text-purple-200 leading-relaxed">
            <span className="font-bold block mb-1 text-purple-300">💡 AI Insight:</span>
            {data.insights}
          </div>

          {/* Covered Skills */}
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Covered Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.coveredSkills.length > 0 ? (
                data.coveredSkills.map((s, idx) => (
                  <span key={idx} className="bg-emerald-950/80 border border-emerald-800/50 text-emerald-300 px-2.5 py-1 rounded-lg font-medium">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">No covered skills detected yet.</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Missing Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.missingSkills.length > 0 ? (
                data.missingSkills.map((s, idx) => (
                  <span key={idx} className="bg-amber-950/80 border border-amber-800/50 text-amber-300 px-2.5 py-1 rounded-lg font-medium">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-emerald-400 font-medium">All required skills covered! 🎉</span>
              )}
            </div>
          </div>

          {/* Recommended Roles to Recruit */}
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 mb-2">
              <UserPlus className="w-3.5 h-3.5 text-purple-400" /> Recommend Recruiting
            </span>
            <div className="space-y-1.5">
              {data.recommendedRolesToHire.map((role, idx) => (
                <div key={idx} className="bg-[#0B0F17] border border-slate-800 p-2 rounded-lg text-slate-200 font-medium">
                  • {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}