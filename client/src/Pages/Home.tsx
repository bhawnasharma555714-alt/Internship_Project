import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
function Home(){
    const {user} = useAuth();
    const navigate = useNavigate();
    return(
        <div>
            <h1>Welcome to ProjectHub</h1>
            <p>Find and collaborate on exciting projects.</p>
            {!user && <Link to="/login">
                <button>Login/Signup</button>
            </Link>}
            {user && 
            <div>
                <button onClick={()=>navigate('/projects')}>See Projects</button>
                <button onClick={()=>navigate('/create-project')}>Upload your Project</button>
            </div>
            }
        </div>
    );
}

export default Home;