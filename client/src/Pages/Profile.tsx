import { useEffect, useState, type SyntheticEvent } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import Layout from "../Components/Layout";
import BackButton from "../Components/BackButton";
import { User,Mail,FileText,Code,Heart,User2,Pencil,ShieldAlert} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import CustomToast from "../Components/CustomToast";

function Profile() {
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [interests, setInterests] = useState(
    user?.interests?.join(", ") || ""
  );
  const [editing,setEditing] = useState(false);
  useEffect(()=>{
    if (user) {
        setBio(user.bio || "");
        setSkills((user.skills || []).join(", "));
        setInterests((user.interests || []).join(", "));
    }
  },[user]);
  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    const toastId = toast.custom(()=>(
          <CustomToast type="info" title="Creating Project" message="Your Project is being created"/>
        ),{duration:Infinity})
    try {
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
      toast.custom(()=>(
        <CustomToast type="success" title="Profile Updated" message="Your Profile has been updated successfully"/>
      ),{duration:1800})

      updateUser(res.data);
    }catch (err: any) {
        toast.remove(toastId);
        toast.custom(()=>(
          <CustomToast type="error" title="Update Failed" message="Unable to update your profile. Please try again."/>
        ),{duration:1800})
    }finally{
        setEditing(false);
        setBio("");
        setInterests("");
        setSkills("");
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-row gap-2 mb-2 justify-center">
            <ShieldAlert className="w-12 h-12 mt-1 text-sky-600 hover:text-sky-500"/>
            <h2 className="text-3xl text-center text-slate-300 font-bold pt-2">Please login first!</h2>
        </div>
         <p className="mt-4 text-slate-400 max-w-lg mx-auto leading-relaxed text-center">You are not authorized to visit this page please login first</p>
        <div className="flex flex-row gap-3 mb-2 justify-center mt-6">
            <Link to="/login" className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">Login/Signup</Link>
            <Link to="/projects" className="border border-sky-600 text-sky-500 hover:bg-sky-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors">Browse Projects</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BackButton/>
      <div className="w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg border-4 border-slate-700 hover:border-slate-600">
        {!editing && (
            <div className="space-y-4">
              <div className="flex flex-row gap-2 mb-2 justify-center">
                <User2 className="w-10 h-10 mt-1 text-sky-600 hover:text-sky-500"/>
                <h1 className="text-4xl text-white font-bold text-center mb-6">My Profile</h1>
              </div>
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
              <div className="border-b border-slate-500">
                <div className="flex flex-row gap-2 justify-center">
                  <Pencil className="w-8 h-8 mt-1 text-sky-600 hover:text-sky-500"/>
                  <h1 className="text-3xl text-white font-bold text-center pr-8">Update Profile</h1>
                </div>
                <p className="text-slate-400 font-medium text-center mt-2 mb-4">Keep your profile up to date</p>
              </div>
              <div className="mt-4">
                <label className="block text-slate-300 font-semibold mb-2">Name</label>
                <input value={user.name} disabled className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-slate-500"/>
              </div>
              <div className="mt-4">
                <label className="block text-slate-300 font-semibold mb-2">Email</label>
                <input value={user.email} disabled className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-slate-500"/>
              </div>
              <div className="mt-4">
                <label className="block text-slate-300 font-semibold mb-2">Bio</label>
                <textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Bio" className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600"/>
              </div>
              <div className="mt-4">
                <label className="block text-slate-300 font-semibold mb-2">Skills<span className="text-slate-400 text-sm font-medium mt-1 pl-4">(Separate skills using commas.)</span></label>
                <input value={skills} onChange={(e)=>setSkills(e.target.value)} placeholder="React, Node.js, MongoDB" className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600"/>
              </div>
              <div className="mt-4">
                <label className="block text-slate-300 font-semibold mb-2">Interests<span className="text-slate-400 text-sm font-medium mt-1 pl-4">(Separate skills using commas.)</span></label>
                <input value={interests} onChange={(e)=>setInterests(e.target.value)} placeholder="AI, Web Development" className="w-full pl-12 pr-4 py-3 rounded-xl border border-sky-700 bg-slate-900 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 hover:border-sky-600"/>
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