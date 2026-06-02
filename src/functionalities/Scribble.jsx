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
                            <List items={files} onRemove={removeFile} onRename={renameFile} />
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