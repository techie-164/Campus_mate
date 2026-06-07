import React, { useState, useEffect } from 'react'
import backgroundImage from '../assets/bg.png'
import { useNavigate } from 'react-router-dom'
import './projects.css'

function Projects(){
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [joinId, setJoinId] = useState('')

  useEffect(()=>{
    const stored = JSON.parse(localStorage.getItem('projects') || '[]')
    setProjects(stored)
  },[])

  useEffect(()=>{
    localStorage.setItem('projects', JSON.stringify(projects))
  },[projects])

  const createProject = () =>{
    if(!newTitle.trim()) return
    const id = String(Date.now())
    const p = { id, title: newTitle }
    setProjects(prev => [p, ...prev])
    setNewTitle('')
    navigate(`/projects/${id}`)
  }

  const requestJoin = () =>{
    if(!joinId.trim()) return alert('Enter project id')
    // naive: if project exists, navigate
    const found = projects.find(p=>p.id===joinId)
    if(found){
      navigate(`/projects/${joinId}`)
    } else {
      alert('Project not found in your list. This demo stores projects locally.')
    }
  }

  return (
    <div className="project-page" style={{ '--bg-img': `url(${backgroundImage})` }}>
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
              <button className="app-button" onClick={createProject}>Create</button>
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
            {projects.length===0 && <div className="empty-state">No projects yet. Create one to get started and it will appear here.</div>}
            {projects.map(p=> (
              <div key={p.id} onClick={()=>navigate(`/projects/${p.id}`)} className="project-card">
                <h4 className="project-card-title">{p.title}</h4>
                <p className="project-card-subtitle">Project ID: {p.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Projects
