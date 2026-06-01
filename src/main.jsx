import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, Routes, createBrowserRouter } from 'react-router-dom'
import { BrowserRouter, Route, createRoutesFromElements} from "react-router-dom";
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import App from './App.jsx'
import './index.css'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<App />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
