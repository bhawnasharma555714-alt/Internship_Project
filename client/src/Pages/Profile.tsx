import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
} from 'lucide-react';

interface UniversityOption {
  name: string;
  country: string;
}

interface LocationOption {
  display_name: string;
  address?: {
    country?: string;
    country_code?: string;
  };
}

export default function Profile(): React.ReactElement {
  const { user, updateUser } = useAuth();

  // Edit Modal Toggle State
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form Fields
  const [bio, setBio] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [interests, setInterests] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [university, setUniversity] = useState<string>('');
  const [jobProfile, setJobProfile] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Autocomplete States
  const [universitySuggestions, setUniversitySuggestions] = useState<UniversityOption[]>([]);
  const [loadingUniversity, setLoadingUniversity] = useState<boolean>(false);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState<boolean>(false);

  const [locationSuggestions, setLocationSuggestions] = useState<LocationOption[]>([]);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);

  const universityRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : '');
      setInterests(Array.isArray(user.interests) ? user.interests.join(', ') : '');
      setLocation(user.location || '');
      setUniversity(user.university || '');
      setJobProfile(user.jobProfile || '');
      setBranch(user.branch || '');

      if (user.location) {
        const parts = user.location.split(',');
        setSelectedCountry(parts[parts.length - 1].trim());
      }
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (universityRef.current && !universityRef.current.contains(event.target as Node)) {
        setShowUniversityDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 1. Location Autocomplete API (Nominatim OpenStreetMap) ---
  useEffect(() => {
    if (!location.trim() || location.length < 2) {
      setLocationSuggestions([]);
      setLoadingLocation(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            location.trim()
          )}&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setLocationSuggestions(data);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      } finally {
        setLoadingLocation(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [location]);

  // --- 2. Filtered & Strict University Autocomplete API (Wikidata HTTPS Search API) ---
useEffect(() => {
  if (!university.trim() || university.length < 2) {
    setUniversitySuggestions([]);
    setLoadingUniversity(false);
    return;
  }

  const timer = setTimeout(async () => {
    setLoadingUniversity(true);
    const query = university.trim();

    try {
      // 1. Query Wikidata search endpoint
      const wikidataUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
        query
      )}&language=en&limit=30&type=item&format=json&origin=*`;

      const response = await fetch(wikidataUrl);
      const data = await response.json();

      if (data.search && data.search.length > 0) {
        // Words that indicate non-educational entities
        const excludedKeywords = [
          'metro station',
          'station',
          'award',
          'honour',
          'stadium',
          'constituency',
          'bus stop',
          'railway',
          'building',
          'cricket ground',
          'campus location',
        ];

        // Educational keywords to prioritize
        const eduKeywords = [
          'university',
          'college',
          'institute',
          'institution',
          'school',
          'academy',
          'polytechnic',
          'education',
        ];

        // 2. Strict Filter: Remove non-university entities
        let filtered = data.search.filter((item: any) => {
          const label = (item.label || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();

          // Exclude metro stations, awards, etc.
          const hasExcludedWord = excludedKeywords.some(
            (word) => label.includes(word) || desc.includes(word)
          );

          if (hasExcludedWord) return false;

          // Must match educational descriptions OR user search query
          const isEduRelated = eduKeywords.some(
            (word) => desc.includes(word) || label.includes(word)
          );

          return isEduRelated;
        });

        // 3. Location Filter: Match selectedCountry if present
        if (selectedCountry.trim()) {
          const targetCountry = selectedCountry.toLowerCase().trim();
          const countryScoped = filtered.filter((item: any) => {
            const desc = (item.description || '').toLowerCase();
            return desc.includes(targetCountry);
          });

          if (countryScoped.length > 0) {
            filtered = countryScoped;
          }
        }

        // Format clean results
        const formatted: UniversityOption[] = filtered.slice(0, 8).map((item: any) => ({
          name: item.label,
          country: item.description || (selectedCountry ? selectedCountry : 'Educational Institution'),
        }));

        if (formatted.length > 0) {
          setUniversitySuggestions(formatted);
          setLoadingUniversity(false);
          return;
        }
      }
    } catch (error) {
      console.error('Wikidata API search error:', error);
    }

    // Dynamic Fallback
    setUniversitySuggestions([
      { name: query, country: selectedCountry ? selectedCountry.toUpperCase() : 'Custom Entry' },
    ]);
    setLoadingUniversity(false);
  }, 300);

  return () => clearTimeout(timer);
}, [university, selectedCountry]);

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
        {/* Main Profile Card View */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border border-sky-400/30 shrink-0">
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

          {/* Skills Section */}
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

          {/* Interests Section */}
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
              Search and select your location and university using live real-time API lookup.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* Location & University Flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Location Input with Nominatim Autocomplete */}
                <div ref={locationRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> 1. Location / Country
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLocation(e.target.value);
                        setShowLocationDropdown(true);
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="Search city or country..."
                      className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 pr-8 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                    />
                    {loadingLocation && (
                      <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin absolute right-3 top-3" />
                    )}
                  </div>

                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {locationSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setLocation(item.display_name);
                            if (item.address?.country) {
                              setSelectedCountry(item.address.country);
                            } else {
                              const parts = item.display_name.split(',');
                              setSelectedCountry(parts[parts.length - 1].trim());
                            }
                            setShowLocationDropdown(false);
                          }}
                          className="p-2.5 text-xs text-slate-200 hover:bg-sky-600/30 hover:text-white cursor-pointer transition border-b border-slate-800/50 last:border-0 truncate"
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* University Input with Wikidata Autocomplete */}
                <div ref={universityRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> 2. University / Organization
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={university}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setUniversity(e.target.value);
                        setShowUniversityDropdown(true);
                      }}
                      onFocus={() => setShowUniversityDropdown(true)}
                      placeholder="Search university globally..."
                      className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-2.5 pr-8 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                    />
                    {loadingUniversity && (
                      <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin absolute right-3 top-3" />
                    )}
                  </div>

                  {showUniversityDropdown && universitySuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {universitySuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setUniversity(item.name);
                            setShowUniversityDropdown(false);
                          }}
                          className="p-2.5 text-xs text-slate-200 hover:bg-sky-600/30 hover:text-white cursor-pointer transition border-b border-slate-800/50 last:border-0 flex flex-col"
                        >
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">{item.country}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Job Profile & Branch */}
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

              {/* Modal Actions */}
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