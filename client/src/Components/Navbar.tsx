import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function Navbar(){
    const {user,logout} = useAuth();
    return(
        <nav>
            <Link to='/'>Home</Link>
            <Link to='/projects'>Projects</Link>
            {user? (
                <>
                    <Link to='/profile'>Profile</Link>
                    <Link to='/my-projects'>My Projects</Link>
                    <Link to='/my-applications'>My Applications</Link>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <Link to='/login'>Login</Link>
            )}
        </nav>
    );

}

export default Navbar;