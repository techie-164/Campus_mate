import React from 'react';

function List({ items = [], onRemove, onRename }){
    return (
        <div className="list">
            {items.length === 0 && (
                <div className="list-empty">No files uploaded</div>
            )}

            {items.map((item, index) => (
                <div className="list-item" key={item.id || index}>
                    <div className="list-item-name" title={item.name}>{item.name}</div>
                    <div className="list-item-actions">
                        <button className="btn btn-primary" onClick={() => alert(`Selected: ${item.name}`)}>Open</button>
                        <button className="btn btn-secondary" onClick={() => onRename && onRename(item.id)}>Rename</button>
                        <button className="btn btn-danger" onClick={() => onRemove && onRemove(item.id)}>Remove</button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default List;