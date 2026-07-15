import { useState, type SyntheticEvent } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";

function Profile() {
  const { user, updateUser } = useAuth();

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
    <div>
      <h1>My Profile</h1>
      {!editing && <h2>{user.name}</h2>}
      {!editing && <p>{user.email}</p>}
      {!editing && <p>{user.bio}</p>}
      {!editing && <p>{user.skills.join(", ")}</p>}
      {!editing && <p>{user.interests.join(", ")}</p>}
      {!editing && <button onClick={() => setEditing(true)}> Update Profile</button>}
      {message && <p>{message}</p>}

      {editing && <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input type="text" value={user.name} disabled />

        <label>Email</label>
        <input type="email" value={user.email} disabled />

        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <label>Skills</label>
        <input
          type="text"
          placeholder="React, Node.js, MongoDB"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />

        <label>Interests</label>
        <input
          type="text"
          placeholder="AI, Web Development"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />

        <button type="submit">Update Profile</button>
      </form>}
    </div>
  );
}

export default Profile;