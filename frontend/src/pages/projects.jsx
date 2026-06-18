import { useState, useEffect } from 'react'
import backgroundImage from '../assets/bg.png'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Sidebar from '../components/Sidebar'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import '../App.css'
import './projects.css'

function Projects(){
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [joinId, setJoinId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchProjects() {
    try {
        const { data } = await api.get('/projects')
        if (data.success) {
            setProjects(data.data)
        }
    } catch (err) {
        setError(err.response?.data?.message || err.message)
    } finally {
        setLoading(false)
    }
  }

  useEffect(()=>{
    fetchProjects()
  },[])

  const createNewProject = async () =>{
    if(!newTitle.trim()) return
    try {
      const { data } = await api.post('/projects', { project_name: newTitle, description: newDesc })
      if (data.success) {
        setProjects(prev => [data.data, ...prev])
        setNewTitle('')
        setNewDesc('')
        setError('')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const removeProject = async (projectId) => {
    if(!confirm('Delete project and its chat/materials?')) return
    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(prev => prev.filter(p => p.project_id !== projectId))
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const requestJoin = async () =>{
    if(!joinId.trim()) return alert('Enter project id')
    try {
      const { data } = await api.post('/projects/join', { project_id: joinId.trim() })
      if (data.success) {
          fetchProjects()
          navigate(`/projects/${joinId.trim()}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Project not found or error joining.')
      alert(err.response?.data?.message || 'Project not found on the backend.')
    }
  }

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      <Topbar />
      {!isSidebarOpen && (
        <button
          className="toggle"
          style={{ left: '20px' }}
          onClick={() => setIsSidebarOpen(true)}
        >
          ⚡
        </button>
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="project-page">
        <div className="page-inner">
          <div className="detail-header">
            <h1 className="page-title">Projects & Collaboration</h1>
            <p className="page-subtitle">Create a new project, request to join one by ID, and open each project to manage materials and chat in one space.</p>
          </div>

          <div className="project-controls">
            <div className="project-panel controls-section">
              <h3>Create new project</h3>
              <div className="controls-row">
                <input className="app-input" placeholder="Project Name" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
                <input className="app-input" placeholder="Description" value={newDesc} onChange={e=>setNewDesc(e.target.value)} />
                <button className="app-button" onClick={createNewProject}>Create</button>
              </div>
            </div>

            <div className="project-panel controls-section">
              <h3>Request to join</h3>
              <div className="controls-row">
                <input className="app-input" placeholder="Project ID to join" value={joinId} onChange={e=>setJoinId(e.target.value)} />
                <button className="app-button" onClick={requestJoin}>Join</button>
              </div>
            </div>
          </div>

          <div className="project-panel">
            <h3 style={{ marginTop: 0 }}>Your Projects</h3>
            <div className="project-card-list">
              {error && <div className="empty-state">Issue: {error}</div>}
              {loading && <div className="empty-state">Loading projects...</div>}
              {!loading && projects.length===0 && <div className="empty-state">No projects yet. Create one to get started and it will appear here.</div>}
              {projects.map(p=> (
                <div key={p._id} className="project-card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                    <div style={{cursor:'pointer'}} onClick={()=>navigate(`/projects/${p.project_id}`)}>
                      <h4 className="project-card-title">{p.project_name}</h4>
                      <p className="project-card-subtitle">Project ID: {p.project_id}</p>
                      {p.owner_id && <p className="project-card-subtitle">Created by {p.owner_id.name}</p>}
                    </div>
                    {p.owner_id && (p.owner_id._id === user?._id || p.owner_id === user?._id) && (
                      <button className="ghost-button" onClick={() => removeProject(p.project_id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Projects
