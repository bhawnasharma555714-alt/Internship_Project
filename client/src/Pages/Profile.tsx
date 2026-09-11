import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import CustomToast from '../Components/CustomToast';
import Layout from '../Components/Layout';
import BackButton from '../Components/BackButton';
import {
  User as UserIcon,
  Mail,
  FileText,
  Code,
  Heart,
  MapPin,
  GraduationCap,
  Briefcase,
  BookOpen,
  X,
  Save,
  Pencil,
  Sparkles,
} from 'lucide-react';

export default function Profile(): React.ReactElement {
  const { user, updateUser } = useAuth();

  // Edit Modal Toggle State
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form Fields
  const [bio, setBio] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [interests, setInterests] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [university, setUniversity] = useState<string>('');
  const [jobProfile, setJobProfile] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : '');
      setInterests(Array.isArray(user.interests) ? user.interests.join(', ') : '');
      setLocation(user.location || '');
      setUniversity(user.university || '');
      setJobProfile(user.jobProfile || '');
      setBranch(user.branch || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);

    const skillsArray = skills
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const interestsArray = interests
      .split(',')
      .map((i: string) => i.trim())
      .filter(Boolean);

    try {
      const res = await api.patch('/users/profile', {
        bio,
        skills: skillsArray,
        interests: interestsArray,
        location,
        university,
        jobProfile,
        branch,
      });

      updateUser(res.data);
      setIsEditing(false);

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

  return (
    <Layout>
      <BackButton />

      <div className="max-w-3xl mx-auto py-4 px-2">
        {/* Main Profile Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          
          {/* Card Header: Avatar, Name & Edit Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border border-sky-400/30 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-7 h-7" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
                <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-1 font-medium">
                  <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="bg-sky-600/90 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Details Metadata Grid */}
          {(user?.jobProfile || user?.university || user?.branch || user?.location) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
              {user?.jobProfile && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-medium">{user.jobProfile}</span>
                </div>
              )}
              {user?.university && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-medium">{user.university}</span>
                </div>
              )}
              {user?.branch && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-medium">{user.branch}</span>
                </div>
              )}
              {user?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-medium">{user.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Bio Section */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" /> Bio
            </span>
            <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/50 italic">
              "{user?.bio || 'No bio provided yet.'}"
            </p>
          </div>

          {/* Skills Badges with Hover Animation */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-sky-400" /> Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-slate-800/80 border border-slate-700/60 text-sky-300 hover:text-white hover:bg-sky-600/30 hover:border-sky-500/50 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-950/40 select-none"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No skills added yet.</span>
              )}
            </div>
          </div>

          {/* Interests Badges with Hover Animation */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-purple-400" /> Interests
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user?.interests && user.interests.length > 0 ? (
                user.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-800/40 hover:border-purple-400/60 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-md hover:shadow-purple-950/40 select-none"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No interests added yet.</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131A29] border border-slate-700/80 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Edit Profile Details
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Keep your information updated to get accurate AI project role matches.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* Job Profile & University */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Job Profile
                  </label>
                  <select
                    value={jobProfile}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setJobProfile(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                  >
                    <option value="">Select Category...</option>
                    <option value="Student">Student</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> University / Organization
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUniversity(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                  />
                </div>
              </div>

              {/* Branch & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Branch / Specialization
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                    placeholder="e.g. New York, USA"
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" /> Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80 resize-none"
                />
              </div>

              {/* Skills Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-sky-400" /> Skills <span className="text-slate-500 font-normal">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
                  placeholder="HTML, CSS, JavaScript, React, Tailwind CSS"
                  className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                />
              </div>

              {/* Interests Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-purple-400" /> Interests <span className="text-slate-500 font-normal">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterests(e.target.value)}
                  placeholder="UI/UX Design, Frontend Development, Open Source"
                  className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}