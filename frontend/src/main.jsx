import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import App from './App.jsx'
import Projects from './pages/projects.jsx'
import ProjectDetail from './pages/projectDetail.jsx'
import './index.css'
import './App.css'
import Scribble from './functionalities/Scribble.jsx'
import PdfAnnotator from './functionalities/PdfAnnotator.jsx'
import Attendance from './functionalities/Attendance.jsx'
import Tasks from './functionalities/Tasks.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<App />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/scribble" element={<Scribble />} />
      <Route path="/annotate" element={<PdfAnnotator />} />
      <Route path="/attendance" element={<Attendance />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
