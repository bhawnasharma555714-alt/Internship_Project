import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../Context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({children}: ProtectedRouteProps){
    const {token,loading} = useAuth();
    if(loading){
        return <h2>Loading...</h2>
    }
    if(!token){
        return <Navigate to='/login'/>
    }
    return  <>{children}</>;
}
export default ProtectedRoute;