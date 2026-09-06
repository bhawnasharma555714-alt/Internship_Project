import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Auth from './Pages/Auth';
import Home from './Pages/Home';
import Project from './Pages/Project';
import Navbar from './Components/Navbar';
import Profile from './Pages/Profile';
import CreateProject from './Pages/CreateProject';
import ProtectedRoute from './Components/ProtectedRoute';
import MyProjects from './Pages/MyProjects';
import ProjectDetails from './Pages/ProjectDetails';
import MyApplications from './Pages/MyApplications';
import EditProject from './Pages/EditProject'; 
import Applicants from './Pages/Applicants';
import socket from './socket';
import VerifyEmail from './Pages/VerifyEmail';

import './app.css';
import NotFound from './Pages/NotFound';
import Chat from './Pages/Chat';
import ResetPassword from './Pages/ResetPassword';
import ForgotPassword from './Pages/ForgotPassword';
import OAuthSuccess from './Pages/OAuthSuccess';


function App() {
  useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to Socket.IO:", socket.id);
        });

        return () => {
            socket.off("connect");
        };
      }, []);
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Auth/>}/>
        <Route path='/projects' element={<Project/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/create-project' element={<ProtectedRoute><CreateProject/></ProtectedRoute>}/>
        <Route path='/my-projects' element={<ProtectedRoute><MyProjects/></ProtectedRoute>}/>
        <Route path='/my-applications' element={<ProtectedRoute><MyApplications/></ProtectedRoute>}/>
        <Route path='/projects/:id' element={<ProjectDetails/>}/>
        <Route path="/applications/:id/applicants" element={<ProtectedRoute><Applicants /></ProtectedRoute>}/>
        <Route path="/project/:id/edit" element={<ProtectedRoute><EditProject /></ProtectedRoute>}/>
        <Route path="*" element={<NotFound />} />
        <Route path="/chat/:projectId" element={<ProtectedRoute><Chat/></ProtectedRoute>} />
        <Route path='/verify-email' element={<VerifyEmail/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/oauth-success' element={<OAuthSuccess/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default App
