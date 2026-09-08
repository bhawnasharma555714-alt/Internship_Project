// Pages/ProjectMatchmaking.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import CustomToast from '../Components/CustomToast';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  User,
  RefreshCw,
} from 'lucide-react';

interface MatchedSkill {
  skillName: string;
  type: 'supported' | 'claimed';
  confidenceScore: number;
}

interface Recommendation {
  project: {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    status: string;
    ownerId?: {
      name: string;
      email: string;
    };
    createdAt: string;
  };
  matchPercentage: number;
  matchedSkills: MatchedSkill[];
  missingSkills: string[];
}

export default function ProjectMatchmaking() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecs, setFilteredRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/matchmaking/recommendations');
      setRecommendations(res.data.recommendations || []);
      setFilteredRecs(res.data.recommendations || []);
    } catch (err: any) {
      toast.custom(
        () => (
          <CustomToast
            type="error"
            title="Matchmaking Error"
            message={err.response?.data?.message || 'Failed to load project recommendations.'}
          />
        ),
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Filter recommendations based on search query and minimum match score
  useEffect(() => {
    let filtered = recommendations.filter((rec) => rec.matchPercentage >= minMatchFilter);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rec) =>
          rec.project.title.toLowerCase().includes(query) ||
          rec.project.description.toLowerCase().includes(query) ||
          rec.project.requiredSkills.some((s) => s.toLowerCase().includes(query))
      );
    }

    setFilteredRecs(filtered);
  }, [searchQuery, minMatchFilter, recommendations]);

  const getMatchMeterColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'bg-sky-500 text-sky-400 border-sky-500/30';
    return 'bg-amber-500 text-amber-400 border-amber-500/30';
  };

  const getMatchBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
    if (score >= 50) return 'bg-sky-950/60 text-sky-300 border-sky-800/60';
    return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-sky-400" />
              AI Project Matchmaker
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Projects matched to your verified GitHub commits and claimed skills.
            </p>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold transition self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            Refresh Matches
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, description, or skill..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Min Match Filter */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-300 flex-shrink-0">Min Match:</span>
            <select
              value={minMatchFilter}
              onChange={(e) => setMinMatchFilter(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-sky-400 focus:outline-none w-full cursor-pointer"
            >
              <option value={0} className="bg-slate-900 text-white">All Matches (0%+)</option>
              <option value={40} className="bg-slate-900 text-white">Fair Matches (40%+)</option>
              <option value={70} className="bg-slate-900 text-white">Strong Matches (70%+)</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Calculating skill match percentages...</p>
          </div>
        ) : filteredRecs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">No Projects Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No projects matched your active filters. Try lowering your minimum match threshold or clearing search terms.
            </p>
          </div>
        ) : (
          /* Recommendations Feed */
          <div className="space-y-5">
            {filteredRecs.map(({ project, matchPercentage, matchedSkills, missingSkills }) => (
              <div
                key={project._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition"
              >
                {/* Top Row: Title + Owner + Match Badge */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {project.title}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Posted by{' '}
                      <span className="text-slate-200 font-medium">
                        {project.ownerId?.name || 'Collaborator'}
                      </span>
                    </p>
                  </div>

                  {/* Match Percentage Pill */}
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 self-start md:self-auto ${getMatchBadgeStyle(matchPercentage)}`}>
                    <Sparkles className="w-4 h-4" />
                    <span className="text-lg font-mono font-extrabold">{matchPercentage}% Match</span>
                  </div>
                </div>

                {/* Project Description */}
                <p className="text-sm text-slate-300 leading-relaxed">{project.description}</p>

                {/* Match Score Meter Bar */}
                <div className="space-y-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Match Accuracy</span>
                    <span className="font-mono text-slate-200">{matchPercentage} / 100</span>
                  </div>
                  <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getMatchMeterColor(matchPercentage)}`}
                      style={{ width: `${matchPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Skills Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Matched Skills */}
                  <div className="space-y-2 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Matched Skills ({matchedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {matchedSkills.length > 0 ? (
                        matchedSkills.map((s) => (
                          <span
                            key={s.skillName}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              s.type === 'supported'
                                ? 'bg-emerald-950/60 text-emerald-200 border-emerald-700/50'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <span>{s.skillName}</span>
                            {s.type === 'supported' && (
                              <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-1 rounded border border-sky-800/40">
                                <ShieldCheck className="w-3 h-3" />
                                {s.confidenceScore}%
                              </span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No skill matches found.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="space-y-2 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing Skills ({missingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {missingSkills.length > 0 ? (
                        missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-medium rounded-lg"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          ✓ You match 100% of required skills!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-2 text-right">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-xs font-semibold rounded-xl text-white transition shadow-md">
                    <span>Apply / Join Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}