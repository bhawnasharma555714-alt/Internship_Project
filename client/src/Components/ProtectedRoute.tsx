import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../Context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({children}: ProtectedRouteProps){
    const {token,loading} = useAuth();
    console.log("Token:", token);
    console.log("Boolean:", !!token);
    if(loading){
        return <h2>Loading...</h2>
    }
    if(!token){
        console.log("INSIDE IF BLOCK");
        return <Navigate to='/login'/>
    }
    console.log("RETURNING CHILDREN");
    return  <>{children}</>;
}
export default ProtectedRoute;