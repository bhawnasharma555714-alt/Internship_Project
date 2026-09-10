import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import CustomToast from '../Components/CustomToast';
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
  ArrowLeft,
  X,
  Save,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile(): React.ReactElement {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Go Back Header Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-semibold text-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>

        {/* Primary Profile Card */}
        <div className="bg-[#131A29] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          
          {/* Section Header */}
          <div className="text-center pb-2">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <UserIcon className="w-7 h-7 text-sky-400" /> My Profile
            </h1>
          </div>

          {/* User Name & Email */}
          <div className="border-b border-slate-800/80 pb-5">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-sky-400" />
              {user?.name}
            </h2>
            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-sky-400" />
              {user?.email}
            </p>
          </div>

          {/* Details Metadata Row */}
          {(user?.jobProfile || user?.university || user?.branch || user?.location) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300 border-b border-slate-800/80 pb-5">
              {user?.jobProfile && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-400" />
                  <span>{user.jobProfile}</span>
                </div>
              )}
              {user?.university && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  <span>{user.university}</span>
                </div>
              )}
              {user?.branch && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>{user.branch}</span>
                </div>
              )}
              {user?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Bio Section */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> Bio
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {user?.bio || 'No bio provided yet.'}
            </p>
          </div>

          {/* Skills Badges */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
              <Code className="w-5 h-5 text-sky-400" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-sky-100 text-sky-950 font-semibold px-4 py-1.5 rounded-full text-sm shadow-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 italic">No skills added yet.</span>
              )}
            </div>
          </div>

          {/* Interests Badges */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
              <Heart className="w-5 h-5 text-sky-400" /> Interests
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {user?.interests && user.interests.length > 0 ? (
                user.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="bg-sky-100 text-sky-950 font-semibold px-4 py-1.5 rounded-full text-sm shadow-sm"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 italic">No interests added yet.</span>
              )}
            </div>
          </div>

          {/* Centered Trigger Button for Editing */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#0284C7] hover:bg-sky-500 text-white font-semibold px-8 py-2.5 rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131A29] border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-sky-400" /> Edit Profile Details
            </h2>

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
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Skills Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-sky-400" /> Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
                  placeholder="HTML, CSS, JavaScript, React, Tailwind CSS"
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Interests Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-sky-400" /> Interests (Comma separated)
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterests(e.target.value)}
                  placeholder="UI/UX Design, Frontend Development, Open Source"
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#0284C7] hover:bg-sky-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}