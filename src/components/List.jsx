import React from 'react';

function List({ items = [], onRemove, onRename, onOpen }){
    return (
        <div className="list">
            {items.length === 0 && (
                <div className="list-empty">No files uploaded</div>
            )}

            {items.map((item, index) => {
                const type = item.type || item.file?.type
                const canAnnotate = type?.includes('pdf') || item.name.toLowerCase().endsWith('.pdf')

                return (
                    <div className="list-item" key={item.id || index}>
                        <div className="list-item-name" title={item.name}>{item.name}</div>
                        <div className="list-item-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (canAnnotate) {
                                        onOpen && onOpen(item)
                                    } else {
                                        alert('Only PDF files can be annotated from this view.')
                                    }
                                }}>
                                {canAnnotate ? 'Annotate' : 'Open'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => onRename && onRename(item.id)}>Rename</button>
                            <button className="btn btn-danger" onClick={() => onRemove && onRemove(item.id)}>Remove</button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default List;