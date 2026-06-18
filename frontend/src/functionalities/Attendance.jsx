import React, { useEffect, useState } from 'react'
import backgroundImage from '../assets/bg.png'
import Topbar from '../components/Topbar'
import Sidebar from '../components/Sidebar'
import '../App.css'
import './Attendance.css'
import { api } from '../lib/api'

function formatDate(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function Attendance(){
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  async function fetchSubjects() {
    try {
      const { data } = await api.get('/attendance')
      if (data.success) {
        setSubjects(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const addSubject = async () => {
    const name = window.prompt('Enter subject name')
    if (!name) return

    try {
      const { data } = await api.post('/attendance', { subject: name })
      if (data.success) {
        setSubjects(prev => [data.data, ...prev])
        setSelectedId(data.data.attendance_id)
      }
    } catch {
      alert("Failed to add subject")
    }
  }

  const removeSubject = async (attendance_id) => {
    if (!confirm('Remove subject and all records?')) return
    try {
      await api.delete(`/attendance/${attendance_id}`)
      setSubjects(prev => prev.filter(s => s.attendance_id !== attendance_id))
      if (selectedId === attendance_id) setSelectedId(null)
    } catch {
      alert("Failed to delete subject")
    }
  }

  const markDate = async (attendance_id, dateStr, flag) => {
    try {
      const { data } = await api.post(`/attendance/${attendance_id}/mark`, { date: dateStr, flag: flag === 'present' ? 'P' : 'A' })
      if (data.success) {
        setSubjects(prev => prev.map(s => s.attendance_id === attendance_id ? data.data : s))
      }
    } catch {
      alert("Failed to mark attendance")
    }
  }

  const selected = subjects.find(s => s.attendance_id === selectedId)

  return (
    <div className="attendance" style={{
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
      <div className="attendance-shell">
        <div className="attendance-list">
          <div className="attendance-list-header">
            <h2>Subjects</h2>
            <div>
              <button className="btn btn-primary" onClick={addSubject}>Add Subject</button>
            </div>
          </div>

          <div className="subjects">
            {loading && <div className="empty">Loading...</div>}
            {!loading && subjects.length === 0 && <div className="empty">No subjects yet. Add one.</div>}
            {subjects.map(s => {
              const percent = s.total_class > 0 ? Math.round((s.total_present / s.total_class) * 100) : 0
              return (
                <div key={s.attendance_id} className={`subject-row ${s.attendance_id === selectedId ? 'active' : ''}`}>
                  <div className="subject-main" onClick={() => { setSelectedId(s.attendance_id); }}>
                    <div className="subject-name">{s.subject}</div>
                    <div className="subject-stats">{s.total_present}/{s.total_class} ({percent}%)</div>
                  </div>
                  <div className="subject-actions">
                    <button className="btn btn-secondary" onClick={() => removeSubject(s.attendance_id)}>Remove</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="attendance-calendar">
          {!selected ? (
            <div className="empty right">Select a subject to see calendar</div>
          ) : (
            <CalendarView
              subject={selected}
              viewMonth={viewMonth}
              setViewMonth={setViewMonth}
              onMark={(dateStr, val) => markDate(selected.attendance_id, dateStr, val)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function CalendarView({ subject, viewMonth, setViewMonth, onMark }){
  const { year, month } = viewMonth
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay() // 0 Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  function prev(){
    const m = month - 1
    if (m < 0) setViewMonth({ year: year - 1, month: 11 })
    else setViewMonth({ year, month: m })
  }
  function next(){
    const m = month + 1
    if (m > 11) setViewMonth({ year: year + 1, month: 0 })
    else setViewMonth({ year, month: m })
  }

  function handleDayClick(d){
    const dateStr = formatDate(d)
    const todayStr = formatDate(today)
    if (dateStr > todayStr) return
    const choice = window.prompt('Mark attendance: p=Present, a=Absent','p')
    if (!choice) return
    const key = choice.toLowerCase()
    if (key === 'p') onMark(dateStr, 'present')
    else if (key === 'a') onMark(dateStr, 'absent')
  }

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <div className="calendar-root">
      <div className="calendar-header">
        <button className="btn" onClick={prev}>&lt;</button>
        <div className="month-label">{firstOfMonth.toLocaleString(undefined, { month: 'long' })} {year}</div>
        <button className="btn" onClick={next}>&gt;</button>
      </div>
      <div className="calendar-grid">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => <div key={h} className="cal-head">{h}</div>)}
        {cells.map((cell, idx) => {
          if (!cell) return <div key={idx} className="cal-cell empty" />
          const dateStr = formatDate(cell)
          const todayStr = formatDate(today)
          const disabled = dateStr > todayStr
          
          let val = null;
          if (subject.status) {
              const record = subject.status.find(r => formatDate(new Date(r.date)) === dateStr);
              if (record) {
                  val = record.flag === 'P' ? 'present' : 'absent';
              }
          }

          const cls = `cal-cell ${disabled ? 'disabled' : ''} ${val === 'present' ? 'present' : ''} ${val === 'absent' ? 'absent' : ''}`
          return (
            <div key={dateStr} className={cls} onClick={() => handleDayClick(cell)}>
              <div className="date-num">{cell.getDate()}</div>
              {val && <div className="mark">{val === 'present' ? 'P' : 'A'}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Attendance
