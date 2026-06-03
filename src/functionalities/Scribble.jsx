import React, { useState, useRef } from 'react';
import './Scribble.css';
import backgroundImage from '../assets/bg.png';
import Topbar from '../Topbar';
import Sidebar from '../components/Sidebar';
import List from '../components/List';

function Scribble(){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [files, setfiles] = useState([])
    const fileInputRef = useRef(null)

    function handleUploadClick(){
        fileInputRef.current && fileInputRef.current.click()
    }

    function handleFilesSelected(e){
        const selected = Array.from(e.target.files || [])
        if(selected.length === 0) return

        const newItems = selected.map((f, idx) => {
            const name = window.prompt('Enter name for file', f.name) || f.name
            return {
                id: Date.now() + Math.random() + idx,
                name,
                file: f,
            }
        })

        setfiles(prev => [...prev, ...newItems])
        // clear input so same file can be uploaded again if needed
        e.target.value = null
    }

    function removeFile(id){
        setfiles(prev => prev.filter(f => f.id !== id))
    }

    function renameFile(id){
        const item = files.find(f => f.id === id)
        if(!item) return
        const newName = window.prompt('Rename file', item.name)
        if(!newName) return
        setfiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f))
    }

    function openFileForAnnotate(item) {
        if (!item?.file) return
        if (!item.file.type.includes('pdf') && !item.name.toLowerCase().endsWith('.pdf')) {
            alert('Only PDF files can be opened in the annotation view.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            localStorage.setItem('campus_mate_pdf_to_annotate', reader.result)
            localStorage.setItem('campus_mate_pdf_name', item.name)
            const w = window.open('/annotate', '_blank')
            if (!w) {
                // popup blocked — don't navigate away from this tab (that would lose in-memory files)
                alert('Popup blocked. Please allow popups for this site so the annotator opens in a new tab, then try Annotate again.')
            }
        }
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