// Pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import CustomToast from '../Components/CustomToast';
import { SkillBreakdownModal } from '../Components/SkillBreakdownModal';
import {
  User as UserIcon,
  Mail,
  FileText,
  Code,
  Heart,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [saving, setSaving] = useState(false);

  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedSkillForBreakdown, setSelectedSkillForBreakdown] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : '');
      setInterests(Array.isArray(user.interests) ? user.interests.join(', ') : '');
    }
  }, [user]);

  const fetchAnalysis = async () => {
    try {
      const res = await api.get('/github-skills');
      setAnalysis(res.data);
    } catch (err) {
      // Analysis might not exist yet for new user
    }
  };

  useEffect(() => {
    if (user?.githubUsername) {
      fetchAnalysis();
    }
  }, [user?.githubUsername]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const interestsArray = interests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      const res = await api.patch('/users/profile', {
        bio,
        skills: skillsArray,
        interests: interestsArray,
      });

      updateUser(res.data);
      await fetchAnalysis();

      toast.custom(
        () => (
          <CustomToast
            type="success"
            title="Profile Updated"
            message="Your profile changes have been saved."
          />
        ),
        { duration: 2000 }
      );
    } catch (err: any) {
      toast.custom(
        () => (
          <CustomToast
            type="error"
            title="Update Failed"
            message={err.response?.data?.message || 'Could not update profile.'}
          />
        ),
        { duration: 2000 }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRunAnalysis = async (force = false) => {
    setAnalyzing(true);
    const toastId = toast.custom(
      () => (
        <CustomToast
          type="info"
          title="Analyzing GitHub"
          message="Scanning commit history and dependencies..."
        />
      ),
      { duration: Infinity }
    );

    try {
      const res = await api.get(`/github-skills/analyze${force ? '?force=true' : ''}`);
      setAnalysis(res.data.profile);
      toast.remove(toastId);
      toast.custom(
        () => (
          <CustomToast
            type="success"
            title="Analysis Complete"
            message={res.data.message || 'Skill analysis completed.'}
          />
        ),
        { duration: 2500 }
      );
    } catch (err: any) {
      toast.remove(toastId);

      const errorMessage =
        err.response?.data?.message || 'Failed to complete GitHub skill analysis.';

      if (err.response?.status === 429) {
        toast.custom(
          () => <CustomToast type="warning" title="Cooldown Active" message={errorMessage} />,
          { duration: 4000 }
        );
        return;
      }

      if (err.response?.status === 401) {
        toast.custom(
          () => (
            <CustomToast
              type="error"
              title="GitHub Session Expired"
              message="Please re-link your GitHub account."
            />
          ),
          { duration: 4000 }
        );
        return;
      }

      toast.custom(
        () => <CustomToast type="error" title="Analysis Failed" message={errorMessage} />,
        { duration: 3000 }
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddSuggestedSkill = async (skillToAdd: string) => {
    const currentSkills = user?.skills || [];
    if (currentSkills.includes(skillToAdd)) return;

    const updatedSkills = [...currentSkills, skillToAdd];

    try {
      const res = await api.patch('/users/profile', {
        skills: updatedSkills,
      });

      updateUser(res.data);
      setSkills(updatedSkills.join(', '));

      const freshAnalysis = await api.get('/github-skills');
      setAnalysis(freshAnalysis.data);

      toast.custom(
        () => (
          <CustomToast
            type="success"
            title="Skill Verified"
            message={`Added "${skillToAdd}" to verified profile skills!`}
          />
        ),
        { duration: 2000 }
      );
    } catch (err) {
      toast.custom(
        () => (
          <CustomToast
            type="error"
            title="Update Failed"
            message="Could not add suggested skill."
          />
        ),
        { duration: 2000 }
      );
    }
  };

  const handleOpenSkillBreakdown = (skillName: string) => {
    const evidenced = analysis?.evidencedSkills?.find(
      (item: any) => item.skillName.toLowerCase() === skillName.toLowerCase()
    );

    if (evidenced) {
      setSelectedSkillForBreakdown(evidenced);
    } else {
      setSelectedSkillForBreakdown({
        skillName,
        confidenceScore: 0,
        sources: [
          {
            repoName: 'Manual Entry',
            filePath: 'Added directly to user profile',
            matchedBy: 'claimed_only',
          },
        ],
      });
    }
  };

  const getConfidenceScorePill = (skillName: string) => {
    const evidenced = analysis?.evidencedSkills?.find(
      (item: any) => item.skillName.toLowerCase() === skillName.toLowerCase()
    );
    if (!evidenced) return null;

    return (
      <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/50">
        {evidenced.confidenceScore}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profile Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-sky-400 text-xl font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-sky-400" />
                {user?.name}
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-4 h-4 text-slate-500" />
                {user?.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" /> Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" /> Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Express.js"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <Heart className="w-4 h-4 text-sky-400" /> Interests
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="AI, Open Source, System Design"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 font-semibold rounded-xl text-sm transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* GitHub Insights Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <img
                  src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  alt="GitHub"
                  className="w-5 h-5 invert brightness-200"
                />
                GitHub Skill Insights
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Linked as{' '}
                <span className="text-sky-400 font-mono">@{user?.githubUsername || 'unlinked'}</span>
              </p>
            </div>
            <button
              onClick={() => handleRunAnalysis(true)}
              disabled={analyzing || !user?.githubUsername}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
          </div>

          {analysis?.outputSummary && (
            <div className="space-y-4">
              {/* Supported Skills */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> ✓ Supported by GitHub Commits
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysis.outputSummary.supportedSkills.length > 0 ? (
                    analysis.outputSummary.supportedSkills.map((skill: string) => (
                      <button
                        key={skill}
                        onClick={() => handleOpenSkillBreakdown(skill)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/50 border border-emerald-700/60 rounded-lg text-xs font-medium text-emerald-200 hover:bg-emerald-800/60 transition cursor-pointer"
                      >
                        <span>{skill}</span>
                        {getConfidenceScorePill(skill)}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No direct commit matches yet.</p>
                  )}
                </div>
              </div>

              {/* Claimed Skills */}
              <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> ! Claimed (No Direct Commit Match)
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysis.outputSummary.claimedOnlySkills.length > 0 ? (
                    analysis.outputSummary.claimedOnlySkills.map((skill: string) => (
                      <button
                        key={skill}
                        onClick={() => handleOpenSkillBreakdown(skill)}
                        className="px-3 py-1.5 bg-amber-900/40 border border-amber-700/50 rounded-lg text-xs font-medium text-amber-200 hover:bg-amber-800/50 transition cursor-pointer"
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">All claimed skills are verified by commits!</p>
                  )}
                </div>
              </div>

              {/* Suggested Skills */}
              <div className="p-4 bg-sky-950/30 border border-sky-800/50 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  + Suggested Skills (Found in Commits)
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysis.outputSummary.suggestedSkills.length > 0 ? (
                    analysis.outputSummary.suggestedSkills.map((skill: string) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-900/40 border border-sky-700/50 rounded-lg text-xs font-medium text-sky-200"
                      >
                        <button
                          onClick={() => handleOpenSkillBreakdown(skill)}
                          className="hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{skill}</span>
                          {getConfidenceScorePill(skill)}
                        </button>
                        <button
                          onClick={() => handleAddSuggestedSkill(skill)}
                          className="ml-1 text-sky-400 hover:text-white transition"
                          title="Add to verified profile skills"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No extra unclaimed skills detected.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Drawer / Modal */}
      <SkillBreakdownModal
        isOpen={!!selectedSkillForBreakdown}
        onClose={() => setSelectedSkillForBreakdown(null)}
        skillData={selectedSkillForBreakdown}
      />
    </div>
  );
}