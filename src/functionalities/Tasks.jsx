import React, { useEffect, useMemo, useState } from 'react'
import backgroundImage from '../assets/bg.png'
import Topbar from '../Topbar'
import Sidebar from '../components/Sidebar'
import '../App.css'
import './Tasks.css'

const STORAGE_KEY = 'campus_mate_tasks'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatDate(date) {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function todayDateString() {
  return formatDate(new Date())
}

function Tasks() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error(e)
      return []
    }
  })

  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState(todayDateString())
  const [targetTime, setTargetTime] = useState('12:00')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const today = useMemo(() => todayDateString(), [])
  const tasksToday = tasks.filter(task => task.createdDate === today)
  const totalToday = tasksToday.length
  const completedToday = tasksToday.filter(task => task.complete).length
  const percentToday = totalToday ? Math.round((completedToday / totalToday) * 100) : 0
  const completedAll = tasks.filter(task => task.complete).length
  const percentAll = tasks.length ? Math.round((completedAll / tasks.length) * 100) : 0

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.complete === b.complete) {
      if (a.targetDate === b.targetDate) return a.targetTime.localeCompare(b.targetTime)
      return a.targetDate.localeCompare(b.targetDate)
    }
    return a.complete ? 1 : -1
  })

  function addTask(event) {
    event.preventDefault()
    if (!title.trim()) return

    const newTask = {
      id: uid(),
      title: title.trim(),
      createdDate: today,
      targetDate,
      targetTime,
      complete: false,
    }

    setTasks(prev => [newTask, ...prev])
    setTitle('')
    setTargetDate(today)
    setTargetTime('12:00')
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  function toggleComplete(id) {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, complete: !task.complete } : task))
  }

  return (
    <div className="tasks-page" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      color: 'white',
    }}>
      {!isSidebarOpen && (
        <button
          className="toggle"
          style={{ left: '20px' }}
          onClick={() => setIsSidebarOpen(true)}>
          ⚡
        </button>
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Topbar />
      <div className="tasks-shell">
        <div className="tasks-top">
          <div>
            <h2>Events & Tasks</h2>
            <p>Manage tasks with due dates, time targets, and completion progress for today and overall.</p>
          </div>
          <div className="tasks-summary">
            <div>
              <span>Today</span>
              <strong>{totalToday} task{totalToday === 1 ? '' : 's'}</strong>
              <small>{completedToday} completed</small>
            </div>
            <div>
              <span>Today complete</span>
              <strong>{percentToday}%</strong>
              <small>of tasks created today</small>
            </div>
            <div>
              <span>Overall complete</span>
              <strong>{percentAll}%</strong>
              <small>{completedAll}/{tasks.length || 0} total</small>
            </div>
          </div>
        </div>

        <div className="tasks-body">
          <form className="task-form" onSubmit={addTask}>
            <div className="task-form-row">
              <label htmlFor="task-title">Task</label>
              <input
                id="task-title"
                type="text"
                placeholder="Add a new task"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="task-form-row split">
              <div>
                <label htmlFor="task-date">Target date</label>
                <input
                  id="task-date"
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="task-time">Target time</label>
                <input
                  id="task-time"
                  type="time"
                  value={targetTime}
                  onChange={e => setTargetTime(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit">Add Task</button>
          </form>

          <div className="task-list">
          {sortedTasks.length === 0 ? (
            <div className="task-empty">No tasks yet. Add one to get started.</div>
          ) : (
            sortedTasks.map(task => (
              <div key={task.id} className={`task-card ${task.complete ? 'complete' : ''}`}>
                <div className="task-card-main">
                  <div>
                    <h3>{task.title}</h3>
                    <div className="task-meta">
                      <span>Created: {task.createdDate}</span>
                      <span>Due: {task.targetDate} at {task.targetTime}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="btn btn-secondary" type="button" onClick={() => toggleComplete(task.id)}>
                      {task.complete ? 'Undo' : 'Done'}
                    </button>
                    <button className="btn btn-danger" type="button" onClick={() => removeTask(task.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
