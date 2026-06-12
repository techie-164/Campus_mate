import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import backgroundImage from '../assets/bg.png'
import Topbar from '../components/Topbar'
import Sidebar from '../components/Sidebar'
import { addProjectMaterial, deleteProjectMaterial, getProject, SOCKET_SERVER_URL } from '../lib/api'
import '../App.css'
import './projectDetail.css'

function ProjectDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [project, setProject] = useState(null)
  const [materials, setMaterials] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loadError, setLoadError] = useState('')
  const [socketStatus, setSocketStatus] = useState('Connecting')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [fileNote, setFileNote] = useState('')
  const [username, setUsername] = useState(() => {
    const stored = localStorage.getItem('username')
    return stored || `User${Math.floor(Math.random() * 1000)}`
  })
  const socketRef = useRef(null)
  const listRef = useRef(null)
  const chatListRef = useRef(null)

  useEffect(() => {
    let ignore = false

    getProject(id)
      .then(data => {
        if (!ignore) {
          setProject(data)
          setMaterials(data.materials || [])
          setLoadError('')
        }
      })
      .catch(err => {
        if (!ignore) setLoadError(err.message)
      })

    return () => {
      ignore = true
    }
  }, [id])

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    newSocket.on('connect', () => {
      setSocketStatus('Live')
      console.log('Connected to socket server')
      newSocket.emit('join-project', id, username)
      newSocket.emit('get-chat-history', id)
    })

    newSocket.on('disconnect', () => {
      setSocketStatus('Offline')
    })

    newSocket.on('connect_error', () => {
      setSocketStatus('Offline')
    })

    newSocket.on('chat-history', (history) => {
      setMessages(history)
      setTimeout(() => {
        if (chatListRef.current) {
          chatListRef.current.scrollTop = chatListRef.current.scrollHeight
        }
      }, 100)
    })

    newSocket.on('receive-message', (data) => {
      setMessages(prev => [...prev, data])
      setTimeout(() => {
        if (chatListRef.current) {
          chatListRef.current.scrollTop = chatListRef.current.scrollHeight
        }
      }, 50)
    })

    newSocket.on('user-joined', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.message,
        username: 'System',
        timestamp: new Date(),
        isSystem: true
      }])
    })

    newSocket.on('user-left', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.message,
        username: 'System',
        timestamp: new Date(),
        isSystem: true
      }])
    })

    newSocket.on('project-users', users => {
      setOnlineUsers(users)
    })

    newSocket.on('material-added', ({ material }) => {
      setMaterials(prev => prev.some(item => item.id === material.id) ? prev : [material, ...prev])
    })

    newSocket.on('material-deleted', ({ materialId }) => {
      setMaterials(prev => prev.filter(material => material.id !== materialId))
    })

    newSocket.on('project-deleted', ({ id: deletedProjectId }) => {
      if (deletedProjectId === id) {
        alert('This project was deleted.')
        navigate('/projects')
      }
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    socketRef.current = newSocket

    return () => {
      if (newSocket) {
        newSocket.emit('leave-project', id)
        newSocket.disconnect()
      }
      socketRef.current = null
    }
  }, [id, navigate, username])

  useEffect(() => {
    localStorage.setItem('username', username)
  }, [username])

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const addMaterial = async () => {
    if (!title.trim() && !selectedFile) return

    const materialTitle = title.trim() || (selectedFile ? selectedFile.name : '')
    let fileData = null
    let fileName = null
    let fileType = null
    let fileSize = null

    if (selectedFile) {
      fileName = selectedFile.name
      fileType = selectedFile.type
      fileSize = selectedFile.size

      if (selectedFile.size <= 500000) {
        fileData = await readFileAsDataUrl(selectedFile)
      }
    }

    const item = {
      title: materialTitle,
      desc,
      fileName,
      fileType,
      fileSize,
      fileData,
      createdBy: username
    }

    try {
      const material = await addProjectMaterial(id, item)
      setMaterials(prev => prev.some(existing => existing.id === material.id) ? prev : [material, ...prev])
      setTitle('')
      setDesc('')
      setSelectedFile(null)
      setFileNote('')
      setLoadError('')
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const deleteMaterial = async (materialId) => {
    if (!confirm('Remove this material?')) return
    try {
      await deleteProjectMaterial(id, materialId)
      setMaterials(prev => prev.filter(m => m.id !== materialId))
      setLoadError('')
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const sendMessage = () => {
    if (!msg.trim() || !socketRef.current) return
    
    socketRef.current.emit('send-message', {
      projectId: id,
      text: msg,
      username: username
    })
    
    setMsg('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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

      <div className="project-detail-page">
        <div className="detail-shell">
          <div className="detail-header">
            <h2>Project collaboration</h2>
            <p>{project?.title || 'Shared project'} · {socketStatus} · {onlineUsers.length} online</p>
            {loadError && <p>Backend issue: {loadError}</p>}
          </div>

          <div className="detail-grid">
            <section className="panel">
              <h3>Materials</h3>
              <div className="material-list" ref={listRef}>
                {materials.length === 0 && <div className="empty-state">No materials yet. Add project files, links or notes to get started.</div>}
                {materials.map(m=> (
                  <article key={m.id} className="material-item">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12}}>
                      <strong>{m.title}</strong>
                      <button className="ghost-button" onClick={() => deleteMaterial(m.id)}>Remove</button>
                    </div>
                    <p>{m.desc || (m.fileName ? `Attached file: ${m.fileName}` : 'No description provided.')}</p>
                    {m.fileName && (
                      <p style={{ margin: '10px 0 0', fontSize: '0.92rem', color: '#b9c4ff' }}>
                        File: {m.fileName} · {(m.fileSize / 1024).toFixed(1)} KB
                        {m.fileData ? (
                          <><br /><a href={m.fileData} download={m.fileName} style={{ color: '#9ddcff' }}>Download</a></>
                        ) : (
                          <span style={{ opacity: 0.8 }}><br />Preview unavailable for large file.</span>
                        )}
                      </p>
                    )}
                  </article>
                ))}
              </div>

              <div className="material-form">
                <input className="app-input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
                <input className="app-input" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#c8d2ff', fontSize: '0.94rem' }}>Attach file</span>
                  <input
                    type="file"
                    className="app-input"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      setSelectedFile(file || null)
                      if (file) {
                        setFileNote(`${file.name} selected`)
                      } else {
                        setFileNote('')
                      }
                    }}
                  />
                </label>
                {fileNote && <div style={{ color: '#c8d2ff', fontSize: '0.95rem' }}>{fileNote}</div>}
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
                  <p style={{margin:0, color:'#c8d2ff', lineHeight:1.8}}>
                    {project?.description || 'Use this center panel as your project hub. Add materials and chat with collaborators in real time.'}
                  </p>
                  <div className="presence-list">
                    <strong>Online collaborators</strong>
                    {onlineUsers.length === 0 ? (
                      <span>No live collaborators yet.</span>
                    ) : (
                      onlineUsers.map((user, index) => <span key={`${user}-${index}`}>{user}</span>)
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                <h3>Chat</h3>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '140px',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'white'
                  }}
                />
              </div>
              <div className="chat-list" ref={chatListRef}>
                {messages.length === 0 && <div className="empty-state">No chat messages yet. Start the conversation with your team.</div>}
                {messages.map(m => (
                  <div 
                    key={m._id || m.id} 
                    className={`chat-message ${m.isSystem ? 'system-message' : ''}`}
                    style={m.isSystem ? { textAlign: 'center', opacity: 0.7, fontSize: '0.9rem' } : {}}
                  >
                    {!m.isSystem && (
                      <div style={{fontSize: '0.85rem', color: '#8dd3ff', marginBottom: '4px', fontWeight: 600}}>
                        {m.username}
                      </div>
                    )}
                    <div>{m.text}</div>
                    {!m.isSystem && (
                      <div style={{fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px'}}>
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="chat-controls">
                <input 
                  className="app-input" 
                  value={msg} 
                  onChange={e => setMsg(e.target.value)} 
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..." 
                />
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
