import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function Navbar(){
    const {user,logout} = useAuth();
    return(
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* <Logo/> */}
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="text-2xl font-bold text-violet-600">Collab Connect</Link>
                    <div className="flex items-center gap-6">
                        <Link to='/' className="text-gray-700 hover:text-violet-600 transition-colors">Home</Link>
                        <Link to='/projects' className="text-gray-700 hover:text-violet-600 transition-colors">Projects</Link>
                        {user? (
                            <>
                                <Link to='/profile' className="text-gray-700 hover:text-violet-600 transition-colors">Profile</Link>
                                <Link to='/my-projects' className="text-gray-700 hover:text-violet-600 transition-colors">My Projects</Link>
                                <Link to='/my-applications' className="text-gray-700 hover:text-violet-600 transition-colors">My Applications</Link>
                                <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors" onClick={logout}>Logout</button>
                            </>
                        ) : (
                            <Link to='/login'>Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );

}

export default Navbar;