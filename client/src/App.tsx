import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import Applicants from './Pages/Applicants';


function App() {
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
