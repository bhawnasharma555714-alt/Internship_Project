import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Orbit,Menu,X } from "lucide-react";
import { useState } from "react";

function Navbar(){
    const {user,logout} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    return(
        <nav className="bg-slate-900 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center justify-between w-full">
                        <Link to="/" className="flex items-center gap-2 text-sky-600 text-3xl font-extrabold"><Orbit size={32} strokeWidth={2.5} />
                            <span className="text-2xl font-bold">CollabConnect</span>
                        </Link>
                        <button className="lg:hidden text-slate-300" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={28} /> : <Menu size={28} />}</button>
                    </div>
                    <div className="hidden lg:flex items-center gap-8">
                        <Link to='/' className="whitespace-nowrap text-slate-400 hover:text-sky-500  duration-100 transition-colors">Home</Link>
                        <Link to='/projects' className="whitespace-nowrap text-slate-400 hover:text-sky-500  duration-100 transition-colors">Projects</Link>
                        {user? (
                            <>
                                <Link to='/profile' className="whitespace-nowrap text-slate-400 hover:text-sky-500  duration-100 transition-colors">Profile</Link>
                                <Link to='/my-projects' className="whitespace-nowrap text-slate-400 hover:text-sky-500  duration-100 transition-colors">My Projects</Link>
                                <Link to='/my-applications' className="whitespace-nowrap text-slate-400 hover:text-sky-500  duration-100 transition-colors">My Applications</Link>
                                <button className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors" onClick={logout}>Logout</button>
                            </>
                        ) : (
                            <Link to='/login' className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors">Login</Link>
                        )}
                    </div>
                </div>
                {menuOpen && (
                    <div className="flex flex-col">
                        <div className="md:hidden flex flex-col gap-4 pb-6">
                            <Link to="/" className="text-slate-300 hover:text-sky-500" onClick={() => setMenuOpen(false)}>Home</Link>
                            <Link to="/projects" className="text-slate-300 hover:text-sky-500" onClick={() => setMenuOpen(false)}>Projects</Link>

                            {user ? (
                                <>
                                    <Link to="/profile" className="text-slate-300 hover:text-sky-500" onClick={() => setMenuOpen(false)}>Profile</Link>
                                    <Link to="/my-projects" className="text-slate-300 hover:text-sky-500"onClick={() => setMenuOpen(false)}>My Projects</Link>
                                    <Link to="/my-applications" className="text-slate-300 hover:text-sky-500" onClick={() => setMenuOpen(false)}>My Applications</Link>
                                    <button onClick={() => { logout();
                                                            setMenuOpen(false);}}
                                        className="bg-sky-700 hover:bg-sky-600 text-white px-4 py-2 rounded-lg w-fit">Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="bg-sky-700 hover:bg-sky-600 text-white px-4 py-2 rounded-lg w-fit">Login</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );

}

export default Navbar;