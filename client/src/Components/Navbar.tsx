import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Orbit, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import CustomToast from "./CustomToast";

function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
            isActive
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
        }`;

    const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `block px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
            isActive
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
        }`;

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        toast.custom(
            () => (
                <CustomToast
                    type="success"
                    title="Logout Successful"
                    message="You have been signed out successfully."
                />
            ),
            { duration: 1500 }
        );
    };

    return (
        <nav className="bg-[#0B0F17] backdrop-blur-md border-b border-sky-800 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 text-sky-500 hover:text-sky-400 transition cursor-pointer">
                        <Orbit size={28} strokeWidth={2.5} />
                        <span className="text-xl font-extrabold text-white tracking-tight">CollabConnect</span>
                    </Link>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        className="lg:hidden text-slate-300 hover:text-white p-1.5 rounded-lg transition cursor-pointer"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1.5">
                        <NavLink to="/" className={navLinkClass}>Home</NavLink>
                        <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>

                        {user ? (
                            <>
                                <NavLink to="/matchmaking" className={navLinkClass}>
                                    <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                                    <span>AI Matchmaker</span>
                                </NavLink>
                                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                                <NavLink to="/my-projects" className={navLinkClass}>My Projects</NavLink>
                                <NavLink to="/my-applications" className={navLinkClass}>My Applications</NavLink>
                                <button
                                    className="ml-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-1.5 rounded-xl transition cursor-pointer text-xs shadow-sm"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="ml-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-1.5 rounded-xl transition cursor-pointer text-xs shadow-sm"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Drawer Navigation */}
                {menuOpen && (
                    <div className="lg:hidden py-3 border-t border-sky-700/40 space-y-1">
                        <NavLink to="/" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                            Home
                        </NavLink>
                        <NavLink to="/projects" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                            Projects
                        </NavLink>

                        {user ? (
                            <>
                                <NavLink to="/matchmaking" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                                    <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                                    <span>AI Matchmaker</span>
                                </NavLink>
                                <NavLink to="/profile" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                                    Profile
                                </NavLink>
                                <NavLink to="/my-projects" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                                    My Projects
                                </NavLink>
                                <NavLink to="/my-applications" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                                    My Applications
                                </NavLink>
                                <div className="pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="pt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-center w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;