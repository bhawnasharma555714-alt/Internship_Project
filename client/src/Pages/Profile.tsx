import { useState, type SyntheticEvent } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import Layout from "../Components/Layout";
import BackButton from "../Components/BackButton";
import { User,Mail,FileText,Code,Heart,User2,Pencil } from "lucide-react";

function Profile() {
  const { user, updateUser } = useAuth();
  const [name,setName] = useState(user?.name || "")
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [interests, setInterests] = useState(
    user?.interests?.join(", ") || ""
  );
  const [message, setMessage] = useState("");
  const [editing,setEditing] = useState(false);

  if (!user) {
    return <h2>Please login first.</h2>;
  }

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    try {
      const res = await api.put("/users/profile", {
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

      updateUser(res.data);
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Failed to update profile");
    }finally{
        setEditing(false);
        setBio("");
        setInterests("");
        setSkills("");
    }
  };

  return (
    <Layout>
      <BackButton/>
      <div className="w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg border-4 border-slate-700 hover:border-slate-600">
        <div className="flex flex-row gap-2 mb-2 justify-center">
            <User2 className="w-10 h-10 mt-1 text-sky-600 hover:text-sky-500"/>
            <h1 className="text-4xl text-white font-bold text-center mb-6">My Profile</h1>
        </div>
        {!editing && (
            <div className="space-y-4">
              <div className="border-b border-slate-600 pb-3 my-6">
                <div className="flex flex-row gap-2 mb-2">
                  <User className="w-7 h-7 mt-1 text-sky-500"/>
                  <h2 className="text-2xl pl-2 font-semibold text-slate-300">{user.name}</h2>
                </div>
                <div className="flex flex-row gap-2 mb-1 mt-3">
                  <Mail className="w-5 h-5 mt-1 text-sky-500"/>
                  <p className="pl-2 text-slate-400 font-medium">{user.email}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-row gap-2 mb-1 mt-3">
                  <FileText className="w-6 h-5 mt-1 text-sky-500"/>
                  <h3 className="text-lg font-semibold text-sky-500">Bio</h3>
                </div>
                <p className="pl-2 text-slate-400 font-medium">{user.bio || "No bio added"}</p>
              </div>

              <div className="mt-4">
                <div className="flex flex-row gap-2 mb-1 mt-3">
                  <Code className="w-6 h-5 mt-1 text-sky-500"/>
                  <h3 className="text-lg font-semibold text-sky-500">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                    {user.skills.map((skill,index) => (
                      <span key={`${skill}-${index}`} className="bg-sky-100 text-sky-900 px-4 py-1.5 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:cursor-pointer">{skill}</span>
                     ))}
                 </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-row gap-2 mb-1 mt-3">
                  <Heart className="w-6 h-5 mt-1 text-sky-500"/>
                  <h3 className="text-lg font-semibold text-sky-500">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                    {user.interests.map((interest,index) => (
                      <span key={`${interest}-${index}`} className="bg-sky-100 text-sky-900 px-4 py-1.5 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:scale-110 hover:cursor-pointer">{interest}</span>
                     ))}
                 </div>
              </div>
              <div className="flex justify-center">
                <button onClick={() => setEditing(true)} className="text-white max-w-xl px-6 py-3 mt-5 bg-sky-800 hover:bg-sky-700 transition-all duration-200 rounded-lg font-semibold">Update Profile</button>
              </div>
              </div>
          )}
          {editing && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-row gap-2 mb-2">
                <Pencil className="w-7 h-6 mt-1 text-sky-600 hover:text-sky-500"/>
                <h2 className="text-xl text-slate-200 font-semibold">Update Profile</h2>
            </div>
              <input value={user.name} disabled className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-800 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600"/>
              <input value={user.email} disabled className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-800 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600"/>
              <textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Bio" className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-800 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"/>

              <input value={skills} onChange={(e)=>setSkills(e.target.value)} placeholder="React, Node.js, MongoDB" className="w-full bg-slate-900 p-3 rounded-lg"/>
              <input value={interests} onChange={(e)=>setInterests(e.target.value)} placeholder="AI, Web Development" className="w-full bg-slate-900 p-3 rounded-lg"/>

              <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 py-2 rounded-lg font-semibold">Save Changes</button>
              </form>
          )}

          {message && (<p className="text-sky-500 text-center mt-4">{message}</p>)}
        </div>
    </Layout>
  );
}

export default Profile;