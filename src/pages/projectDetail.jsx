import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import backgroundImage from '../assets/bg.png'
import './projectDetail.css'

function ProjectDetail(){
  const { id } = useParams()
  const [materials, setMaterials] = useState([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const listRef = useRef(null)

  useEffect(()=>{
    const m = JSON.parse(localStorage.getItem(`materials_${id}`) || '[]')
    setMaterials(m)
    const c = JSON.parse(localStorage.getItem(`chat_${id}`) || '[]')
    setMessages(c)
  },[id])

  useEffect(()=>{
    localStorage.setItem(`materials_${id}`, JSON.stringify(materials))
  },[materials,id])

  useEffect(()=>{
    localStorage.setItem(`chat_${id}`, JSON.stringify(messages))
  },[messages,id])

  const addMaterial = ()=>{
    if(!title.trim()) return
    const item = { id: Date.now(), title, desc }
    setMaterials(prev=>[item, ...prev])
    setTitle(''); setDesc('')
  }

  const sendMessage = ()=>{
    if(!msg.trim()) return
    const m = { id: Date.now(), text: msg }
    setMessages(prev=>[...prev, m])
    setMsg('')
    setTimeout(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, 50)
  }

  return (
    <div className="project-detail-page" style={{ '--bg-img': `url(${backgroundImage})` }}>
      <div className="detail-shell">
        <div className="detail-header">
          <h2>Project collaboration</h2>
          <p>Share materials, keep project details in one place, and chat with collaborators as you build the project.</p>
        </div>

        <div className="detail-grid">
          <section className="panel">
            <h3>Materials</h3>
            <div className="material-list" ref={listRef}>
              {materials.length === 0 && <div className="empty-state">No materials yet. Add project files, links or notes to get started.</div>}
              {materials.map(m=> (
                <article key={m.id} className="material-item">
                  <strong>{m.title}</strong>
                  <p>{m.desc || 'No description provided.'}</p>
                </article>
              ))}
            </div>

            <div className="material-form">
              <input className="app-input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
              <input className="app-input" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
              <button className="app-button" onClick={addMaterial}>Add Material</button>
            </div>
          </section>

          <section className="panel">
            <div className="detail-header">
              <h2>Project ID: {id}</h2>
              <p>This workspace shows the current project summary and gives you a place to wire next features like tasks, notes, or file previews.</p>
            </div>
            <div style={{flex:1}}>
              <div className="project-card" style={{padding:'24px', minHeight:'460px'}}>
                <h3 style={{margin:'0 0 12px'}}>Project overview</h3>
                <p style={{margin:0, color:'#c8d2ff', lineHeight:1.8}}>Use this center panel as your project hub. Add actionable cards for milestones, deadlines, shared docs, or meeting notes.</p>
              </div>
            </div>
          </section>

          <section className="panel">
            <h3>Chat</h3>
            <div className="chat-list">
              {messages.length === 0 && <div className="empty-state">No chat messages yet. Start the conversation with your team.</div>}
              {messages.map(m=> (
                <div key={m.id} className="chat-message">{m.text}</div>
              ))}
            </div>

            <div className="chat-controls">
              <input className="app-input" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Type a message" />
              <button className="app-button" onClick={sendMessage}>Send</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
