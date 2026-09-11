import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Sparkles, Search, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Send, X,Check} from 'lucide-react';
import api from '../services/api';
import type { project as Project } from '../types/project';

export interface RecommendationItem {
  project: Project;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface RecommendationResponse {
  count: number;
  recommendations: RecommendationItem[];
}

interface Application {
  project: string; // Project ID
  status: string;
}

export default function ProjectMatchmaking(): React.ReactElement {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minMatch, setMinMatch] = useState<number>(0);

  // Modal & Toast State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [applyMessage, setApplyMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<string>('');

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch recommendations and existing applications in parallel
      const [recsRes, appsRes] = await Promise.all([
        api.get<RecommendationResponse>('/matchmaking/recommendations'),
        api.get<Application[]>('/applications/my')
      ]);

      setRecommendations(recsRes.data.recommendations || []);
      setUserApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplySubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedProject) return;

    setSubmitting(true);
    try {
      await api.post(`/applications/${selectedProject.id}/apply`, {
        message: applyMessage,
      });
      setToast(`Application submitted for ${selectedProject.title}!`);
      setSelectedProject(null);
      setApplyMessage('');

      // Refresh applications list to update button state immediately
      const appsRes = await api.get<Application[]>('/applications/my');
      setUserApplications(appsRes.data || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to submit application.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(''), 4000);
    }
  };

  // Check if user has already applied to a specific project
  const hasApplied = (projectId: string): boolean => {
    return userApplications.some((app) => app.project === projectId);
  };

  const filteredRecommendations = recommendations.filter((item) => {
    const titleMatch = item.project?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = item.project?.desc?.toLowerCase().includes(searchTerm.toLowerCase());
    const scoreMatch = item.matchPercentage >= minMatch;
    return (titleMatch || descMatch) && scoreMatch;
  });

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-6 md:p-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl font-medium flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Project Matchmaker <Sparkles className="w-6 h-6 text-sky-400" />
          </h1>
          <p className="text-slate-400 mt-1">
            Projects dynamically matched to your profile skills and bio.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition font-medium text-sm w-fit cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="max-w-3xl mx-auto bg-[#131A29] p-4 rounded-2xl border border-slate-800 mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title, description, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={minMatch}
          onChange={(e) => setMinMatch(Number(e.target.value))}
          className="bg-[#0B0F17] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value={0}>Min Match: All Matches (0%+)</option>
          <option value={50}>Min Match: 50%+</option>
          <option value={75}>Min Match: 75%+</option>
          <option value={90}>Min Match: 90%+</option>
        </select>
      </div>

      {/* Feed List */}
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400" />
            <p>Analyzing skill match scores...</p>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-20 bg-[#131A29] rounded-2xl border border-slate-800 text-slate-400">
            No projects match your current filter settings.
          </div>
        ) : (
          filteredRecommendations.map(({ project, matchPercentage, matchedSkills = [], missingSkills = [] }) => {
            const isApplied = hasApplied(project.id);

            return (
              <div
                key={project.id}
                className="bg-[#131A29] border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">{project.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Posted by <span className="text-slate-300 font-medium">{project.creator?.name || 'Collaborator'}</span> • Needs <span className="text-sky-400 font-medium">{project.membersRequired || 1} Members</span>
                    </p>
                  </div>

                  {/* Match Percentage Pill */}
                  <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-500/30 text-sky-400 px-3.5 py-1.5 rounded-xl font-semibold text-sm w-fit">
                    <Sparkles className="w-4 h-4" />
                    <span>{matchPercentage}% Match</span>
                  </div>
                </div>

                {/* Description */}
                {project.desc && (
                  <p className="text-sm text-slate-300 mb-5 leading-relaxed">{project.desc}</p>
                )}

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                    <span>Match Accuracy</span>
                    <span className="text-sky-400">{matchPercentage} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${matchPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Skills Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Matched Skills Box */}
                  <div className="bg-[#0B0F17]/70 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Matched Skills ({matchedSkills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.length > 0 ? (
                        matchedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 px-3 py-1 rounded-lg text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No direct skill overlap</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills Box */}
                  <div className="bg-[#0B0F17]/70 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span>Missing Skills ({missingSkills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.length > 0 ? (
                        missingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-950/50 text-amber-300 border border-amber-800/50 px-3 py-1 rounded-lg text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400 font-medium">You possess all required skills!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conditional Action Button */}
                <div className="flex justify-end pt-2 border-t border-slate-800/60">
                  {isApplied ? (
                    <button
                      disabled
                      className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-semibold px-5 py-2.5 rounded-xl text-sm cursor-not-allowed opacity-90"
                    >
                      <Check className="w-4 h-4" />
                      <span>Already Applied</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-lg shadow-sky-500/10 cursor-pointer"
                    >
                      <span>Apply / Join Project</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Application Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131A29] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Apply to {selectedProject.title}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Send an optional message to the project creator explaining your skills and role interest.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cover Note / Message <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Introduce yourself or leave blank to apply using your profile details..."
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Send Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}