import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Orbit } from "lucide-react";

function Navbar(){
    const {user,logout} = useAuth();
    return(
        <nav className="bg-slate-900 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-2 text-sky-600 text-3xl font-extrabold"><Orbit size={32} strokeWidth={2.5} />
                            <span className="text-2xl font-bold">CollabConnect</span>
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link to='/' className="text-slate-400 hover:text-sky-500  duration-100 transition-colors">Home</Link>
                        <Link to='/projects' className="text-slate-400 hover:text-sky-500  duration-100 transition-colors">Projects</Link>
                        {user? (
                            <>
                                <Link to='/profile' className="text-slate-400 hover:text-sky-500  duration-100 transition-colors">Profile</Link>
                                <Link to='/my-projects' className="text-slate-400 hover:text-sky-500  duration-100 transition-colors">My Projects</Link>
                                <Link to='/my-applications' className="text-slate-400 hover:text-sky-500  duration-100 transition-colors">My Applications</Link>
                                <button className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors" onClick={logout}>Logout</button>
                            </>
                        ) : (
                            <Link to='/login' className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );

}

export default Navbar;