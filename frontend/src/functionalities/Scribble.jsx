import React, { useEffect, useState, useRef } from 'react';
import './Scribble.css';
import '../App.css';
import backgroundImage from '../assets/bg.png';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import List from '../components/List';

const STORAGE_KEY = 'campus_mate_scribble_files'

function Scribble(){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return
        try {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) setFiles(parsed)
        } catch (err) {
            console.error('Failed to parse stored scribble files', err)
        }
    }, [])

    function saveFiles(nextFiles) {
        const resolver = typeof nextFiles === 'function' ? nextFiles : () => nextFiles
        setFiles(prev => {
            const resolved = resolver(prev)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved))
            return resolved
        })
    }

    function handleUploadClick(){
        fileInputRef.current && fileInputRef.current.click()
    }

    async function handleFilesSelected(e){
        const selected = Array.from(e.target.files || [])
        if(selected.length === 0) return

        const newItems = await Promise.all(selected.map((f, idx) => {
            return new Promise((resolve) => {
                const name = window.prompt('Enter name for file', f.name) || f.name
                const reader = new FileReader()
                reader.onload = () => {
                    resolve({
                        id: Date.now() + Math.random() + idx,
                        name,
                        type: f.type,
                        size: f.size,
                        dataUrl: reader.result,
                    })
                }
                reader.readAsDataURL(f)
            })
        }))

        saveFiles(prev => [...prev, ...newItems])
        e.target.value = null
    }

    function removeFile(id){
        saveFiles(prev => prev.filter(f => f.id !== id))
    }

    function renameFile(id){
        const item = files.find(f => f.id === id)
        if(!item) return
        const newName = window.prompt('Rename file', item.name)
        if(!newName) return
        saveFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f))
    }

    function openFileForAnnotate(item) {
        const canAnnotate = item.type?.includes('pdf') || item.name.toLowerCase().endsWith('.pdf')
        if (!canAnnotate) {
            alert('Only PDF files can be opened in the annotation view.')
            return
        }

        const openAnnotator = (dataUrl) => {
            localStorage.setItem('campus_mate_pdf_to_annotate', dataUrl)
            localStorage.setItem('campus_mate_pdf_name', item.name)
            const w = window.open('/annotate', '_blank')
            if (!w) {
                alert('Popup blocked. Please allow popups for this site so the annotator opens in a new tab, then try Annotate again.')
            }
        }

        if (item.dataUrl) {
            openAnnotator(item.dataUrl)
            return
        }

        if (!item.file) {
            alert('File data is unavailable. Please re-upload the file.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => openAnnotator(reader.result)
        reader.readAsDataURL(item.file)
    }

    return (
        <div
            className="scribble"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
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
            <div className="scribble-content">
                <div className="center-area">
                    <div className="center-block">
                        <div className="list-wrapper">
                            <List items={files} onRemove={removeFile} onRename={renameFile} onOpen={openFileForAnnotate} />
                        </div>

                        <div className="upload-col">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFilesSelected}
                            />

                            <button className="btn btn-primary upload-button" onClick={handleUploadClick}>Upload Files</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Scribble;