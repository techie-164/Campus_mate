import React, { useEffect, useState } from 'react'
import backgroundImage from '../assets/bg.png'
import Topbar from '../Topbar'
import './Attendance.css'

const STORAGE_SUBJECTS = 'campus_mate_attendance'
const STORAGE_SELECTED = 'campus_mate_attendance_selected'
const STORAGE_VIEW_MONTH = 'campus_mate_attendance_month'

function uid() { return Date.now() + Math.random() }

function formatDate(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function daysBetween(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.floor((utc2 - utc1) / _MS_PER_DAY)
}

function Attendance(){
  const [subjects, setSubjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_SUBJECTS)
    if (raw) {
      try {
        setSubjects(JSON.parse(raw))
      } catch (e) {
        console.error(e)
      }
    }

    const savedId = localStorage.getItem(STORAGE_SELECTED)
    if (savedId) {
      setSelectedId(savedId)
    }

    const savedMonth = localStorage.getItem(STORAGE_VIEW_MONTH)
    if (savedMonth) {
      try {
        setViewMonth(JSON.parse(savedMonth))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_SUBJECTS, JSON.stringify(subjects))
    if (selectedId && !subjects.some(s => s.id === selectedId)) {
      setSelectedId(null)
    }
  }, [subjects, selectedId])

  useEffect(() => {
    if (selectedId) localStorage.setItem(STORAGE_SELECTED, selectedId)
    else localStorage.removeItem(STORAGE_SELECTED)
  }, [selectedId])

  useEffect(() => {
    localStorage.setItem(STORAGE_VIEW_MONTH, JSON.stringify(viewMonth))
  }, [viewMonth])

  function addSubject(){
    const name = window.prompt('Enter subject name')
    if (!name) return
    const start = window.prompt('Enter start date (YYYY-MM-DD)')
    if (!start) return
    const sd = new Date(start)
    if (isNaN(sd)) { alert('Invalid date'); return }

    const newSub = { id: uid(), name, startDate: formatDate(sd), records: {} }
    setSubjects(prev => [newSub, ...prev])
    setSelectedId(newSub.id)
    setViewMonth({ year: sd.getFullYear(), month: sd.getMonth() })
  }

  function removeSubject(id){
    if (!confirm('Remove subject and all records?')) return
    setSubjects(prev => prev.filter(s => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function markDate(subjectId, dateStr, value){
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s
      const records = { ...(s.records || {}) }
      if (value === null) delete records[dateStr]
      else records[dateStr] = value
      return { ...s, records }
    }))
  }

  function getStats(s){
    const today = new Date()
    const start = new Date(s.startDate)
    if (isNaN(start)) return { total: 0, present: 0 }
    const total = daysBetween(start, today) + 1
    const present = Object.entries(s.records || {}).filter(([d,v]) => v === 'present' && new Date(d) >= start && new Date(d) <= today).length
    return { total: Math.max(0, total), present }
  }

  const selected = subjects.find(s => s.id === selectedId)

  return (
    <div className="attendance" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
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
            {subjects.length === 0 && <div className="empty">No subjects yet. Add one.</div>}
            {subjects.map(s => {
              const stats = getStats(s)
              const percent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
              return (
                <div key={s.id} className={`subject-row ${s.id === selectedId ? 'active' : ''}`}>
                  <div className="subject-main" onClick={() => { setSelectedId(s.id); const sd = new Date(s.startDate); setViewMonth({ year: sd.getFullYear(), month: sd.getMonth() }) }}>
                    <div className="subject-name">{s.name}</div>
                    <div className="subject-stats">{stats.present}/{stats.total} ({percent}%)</div>
                  </div>
                  <div className="subject-actions">
                    <button className="btn btn-secondary" onClick={() => removeSubject(s.id)}>Remove</button>
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
              onMark={(dateStr, val) => markDate(selected.id, dateStr, val)}
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
  const startDate = new Date(subject.startDate)

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
    if (d < startDate || d > today) return
    const choice = window.prompt('Mark attendance: p=Present, a=Absent, c=Cancel','p')
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
          const disabled = (cell < startDate) || (cell > today)
          const val = (subject.records && subject.records[dateStr]) || null
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
