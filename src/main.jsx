import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import App from './App.jsx'
import './index.css'
import Scribble from './functionalities/Scribble.jsx'
import PdfAnnotator from './functionalities/PdfAnnotator.jsx'
import Attendance from './functionalities/Attendance.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<App />} />
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
