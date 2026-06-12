import { useState, useEffect } from 'react'
import backgroundImage from '../assets/bg.png'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Topbar from '../components/Topbar'
import Sidebar from '../components/Sidebar'
import { createProject, deleteProject, getProject, getProjects, SOCKET_SERVER_URL } from '../lib/api'
import '../App.css'
import './projects.css'

function Projects(){
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [joinId, setJoinId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username] = useState(() => localStorage.getItem('username') || `User${Math.floor(Math.random() * 1000)}`)

  useEffect(()=>{
    let ignore = false

    getProjects()
      .then(data => {
        if (!ignore) {
          setProjects(data)
          setError('')
        }
      })
      .catch(err => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  },[])

  useEffect(() => {
    localStorage.setItem('username', username)

    const socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socket.on('project-created', project => {
      setProjects(prev => prev.some(item => item.id === project.id) ? prev : [project, ...prev])
    })

    socket.on('project-updated', project => {
      setProjects(prev => {
        const exists = prev.some(item => item.id === project.id)
        return exists ? prev.map(item => item.id === project.id ? project : item) : [project, ...prev]
      })
    })

    socket.on('project-deleted', ({ id }) => {
      setProjects(prev => prev.filter(project => project.id !== id))
    })

    return () => socket.disconnect()
  }, [username])

  const createNewProject = async () =>{
    if(!newTitle.trim()) return
    try {
      const project = await createProject({ title: newTitle, ownerName: username })
      setProjects(prev => prev.some(item => item.id === project.id) ? prev : [project, ...prev])
      setNewTitle('')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeProject = async (projectId) => {
    if(!confirm('Delete project and its chat/materials?')) return
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const requestJoin = async () =>{
    if(!joinId.trim()) return alert('Enter project id')
    try {
      const project = await getProject(joinId.trim())
      setProjects(prev => prev.some(item => item.id === project.id) ? prev : [project, ...prev])
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError(err.message)
      alert('Project not found on the backend.')
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
                <input className="app-input" placeholder="New project title" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
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
              {error && <div className="empty-state">Backend issue: {error}</div>}
              {loading && <div className="empty-state">Loading projects...</div>}
              {!loading && projects.length===0 && <div className="empty-state">No projects yet. Create one to get started and it will appear here.</div>}
              {projects.map(p=> (
                <div key={p.id} className="project-card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                    <div style={{cursor:'pointer'}} onClick={()=>navigate(`/projects/${p.id}`)}>
                      <h4 className="project-card-title">{p.title}</h4>
                      <p className="project-card-subtitle">Project ID: {p.id}</p>
                      {p.ownerName && <p className="project-card-subtitle">Created by {p.ownerName}</p>}
                    </div>
                    <button className="ghost-button" onClick={() => removeProject(p.id)}>Delete</button>
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
