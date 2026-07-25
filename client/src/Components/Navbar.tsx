import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Orbit,Menu,X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import CustomToast from "./CustomToast";
import { NavLink } from "react-router-dom";

function Navbar(){
    const {user,logout} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>`whitespace-nowrap px-3 py-2 rounded-lg transition-all duration-200 ${isActive
            ? "text-sky-400"
            : "text-slate-300 hover:text-white"
    }`;
    const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>`block px-4 py-2 rounded-lg transition-all duration-200 ${isActive
            ? "text-sky-500"
            : "text-slate-300 hover:bg-slate-800 hover:text-sky-400"
    }`;
    const handleLogout = () => {
        logout();
        {menuOpen && setMenuOpen(false)};
        toast.custom(()=>(
            <CustomToast type="success" title="Logout Successful" message="You have been signed out successfully."/>
        ),{duration:1500})
    }
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
                    <div className="hidden lg:flex items-center gap-2">
                        <NavLink to='/' className={navLinkClass}>Home</NavLink>
                        <NavLink to='/projects' className={navLinkClass}>Projects</NavLink>
                        {user? (
                            <>
                                <NavLink to='/profile' className={navLinkClass}>Profile</NavLink>
                                <NavLink to='/my-projects' className={navLinkClass}>My Projects</NavLink>
                                <NavLink to='/my-applications' className={navLinkClass}>My Applications</NavLink>
                                <button className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors" onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <Link to='/login' className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors">Login</Link>
                        )}
                    </div>
                </div>
                {menuOpen && (
                    <div className="flex flex-col">
                        <div className="lg:hidden flex flex-col pb-3">
                            <NavLink to="/" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
                            <NavLink to="/projects" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>Projects</NavLink>

                            {user ? (
                                <>
                                    <NavLink to="/profile" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>Profile</NavLink>
                                    <NavLink to="/my-projects" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>My Projects</NavLink>
                                    <NavLink to="/my-applications" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>My Applications</NavLink>
                                    <button onClick={handleLogout}
                                        className="mt-4 bg-sky-700 hover:bg-sky-600 text-white px-4 py-2 rounded-lg w-fit">Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="mt-4 bg-sky-700 hover:bg-sky-600 text-white px-4 py-2 rounded-lg w-fit">Login</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );

}

export default Navbar;