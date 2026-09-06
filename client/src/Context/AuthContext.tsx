import { createContext, useContext,useState,useEffect,type ReactNode} from "react";
import type { AuthUser } from "../types/AuthUser";
import socket from "../socket";
import api from "../services/api";

interface AuthContextType{
    user: AuthUser | null;
    token: string | null;
    login: (token: string , user:AuthUser) => void;
    logout: () => void;
    loading: boolean;
    updateUser: (use:AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({children}: AuthProviderProps){
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token,setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    //Restore user a fter Refresh
    useEffect(()=> {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if(savedToken && savedUser){
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    },[])

    const login = (token: string, user:AuthUser) => {
        localStorage.setItem("token",token);
        localStorage.setItem("user", JSON.stringify(user));

        setToken(token);
        setUser(user);
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        if (socket) {
            socket.disconnect();
        }
    }
    const updateUser = (user: AuthUser) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
    };
    return(
        <AuthContext.Provider value = {{user,token,login,logout,loading,updateUser}}>{children}</AuthContext.Provider>
    );

}

export function useAuth() {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}