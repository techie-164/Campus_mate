import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import backgroundImage from '../assets/bg.png'
import Topbar from '../components/Topbar'
import Sidebar from '../components/Sidebar'
import '../App.css'
import './projectDetail.css'
import { api, SOCKET_SERVER_URL } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'

function ProjectDetail(){
  const { id } = useParams()
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [project, setProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const listRef = useRef(null)
  const socketRef = useRef(null)

  const projectIdRef = useRef(null)

  function scrollToBottom() {
    setTimeout(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, 50)
  }

  async function fetchProjectDetails() {
    try {
      const { data } = await api.get(`/projects/${id}`)
      if (data.success) {
        setProject(data.data)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  async function fetchMessages() {
    try {
      const { data } = await api.get(`/projects/${id}/chat`)
      if (data.success) {
        setMessages(data.data)
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  async function sendMessage(){
    if(!msg.trim()) return
    try {
      await api.post(`/projects/${id}/chat`, { text: msg })
      setMsg('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  useEffect(()=>{
    fetchProjectDetails()
    fetchMessages()

    // Initialize Socket
    socketRef.current = io(SOCKET_SERVER_URL, {
      withCredentials: true
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to socket')
      socketRef.current.emit('join-project', id)
    })

    socketRef.current.on('new-message', (newMessage) => {
      // Ensure the message belongs to this project
      if (newMessage.project_id === projectIdRef.current) {
        setMessages(prev => [...prev, newMessage])
        scrollToBottom()
      }
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-project', id)
        socketRef.current.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[id])

  useEffect(() => {
    if (project) {
        projectIdRef.current = project._id
    }
  }, [project])

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

      <div className="project-detail-page">
        <div className="detail-shell">
          <div className="detail-header">
            <h2>{project ? project.project_name : 'Loading Project...'}</h2>
            <p>{project ? project.description : 'Project Details'}</p>
          </div>

          <div className="detail-grid">
            <section className="panel">
              <div className="detail-header">
                <h2>Project ID: {id}</h2>
                <p>Share this ID with others to let them join this project.</p>
              </div>
              <div style={{flex:1}}>
                <div className="project-card" style={{padding:'24px', minHeight:'460px'}}>
                  <h3 style={{margin:'0 0 12px'}}>Members</h3>
                  {project && project.members && project.members.map(member => (
                    <div key={member._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#4facfe', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                            {member.name[0].toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{member.email}</div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel" style={{ gridColumn: 'span 2' }}>
              <h3>Team Chat</h3>
              <div className="chat-list" ref={listRef}>
                {messages.length === 0 && <div className="empty-state">No chat messages yet. Start the conversation with your team.</div>}
                {messages.map(m=> (
                  <div key={m._id} className="chat-message" style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_id?._id === user?._id ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>{m.sender_id?.name || 'Unknown'}</div>
                    <div style={{ 
                        background: m.sender_id?._id === user?._id ? 'rgba(79, 172, 254, 0.8)' : 'rgba(255, 255, 255, 0.15)',
                        padding: '10px 15px',
                        borderRadius: '15px',
                        borderBottomRightRadius: m.sender_id?._id === user?._id ? '5px' : '15px',
                        borderBottomLeftRadius: m.sender_id?._id === user?._id ? '15px' : '5px',
                        maxWidth: '80%',
                        wordBreak: 'break-word'
                    }}>
                        {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-controls">
                <input className="app-input" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Type a message" onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }} />
                <button className="app-button" onClick={sendMessage}>Send</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
