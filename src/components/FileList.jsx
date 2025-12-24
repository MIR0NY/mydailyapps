import React from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { FileImage, CheckCircle, AlertCircle, Loader2, X, Trash2, ArrowUpDown, GripVertical } from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileList = ({ files, setFiles, onRemove }) => {
  if (!files || files.length === 0) return null;

  const handleSort = () => {
    // Natural sort algorithm to handle 1.jpg, 2.jpg, 10.jpg cleanly
    const sorted = [...files].sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    setFiles(sorted);
  };

  return (
    <div className="file-list-container fade-in">
      <div className="file-list-header">
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Files ({files.length})</span>
        <div className="flex gap-2">
          <button 
            onClick={handleSort} 
            className="btn-icon"
            title="Sort by Name (Natural)"
            style={{ borderRadius: '4px', padding: '4px 8px', gap: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
          >
            <ArrowUpDown size={14} /> Sort
          </button>
          <button 
            onClick={() => onRemove('all')} 
            className="btn-icon"
            title="Clear All"
            style={{ borderRadius: '4px', padding: '4px 8px', gap: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
      
      <div className="file-list-scroll custom-scrollbar">
        <Reorder.Group axis="y" values={files} onReorder={setFiles} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <AnimatePresence initial={false}>
            {files.map((file) => (
              <Reorder.Item 
                key={file.id || file.name} // Ensure we have a unique key. We might need to add one in App.jsx if duplicates exist, but name+idx is risky if reordering. Using object ref is safest or adding ID.
                value={file}
                style={{ position: 'relative' }}
              >
                <div className="file-item" style={{ cursor: 'grab' }}>
                  <div className="text-slate-600 mr-2" style={{ cursor: 'grab' }}>
                    <GripVertical size={16} />
                  </div>
                  
                  <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex' }}>
                    <FileImage size={20} color="#60a5fa" />
                  </div>
                  
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      <span>{formatSize(file.size)}</span>
                      {file.status === 'done' && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--success)' }}>JPG: {formatSize(file.newSize)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="file-actions">
                     {file.status === 'pending' && (
                       <button onClick={(e) => { e.stopPropagation(); onRemove(file); }} className="btn-icon">
                         <X size={16} />
                       </button>
                     )}
                     {file.status === 'converting' && <Loader2 className="animate-spin" size={20} color="#60a5fa" />}
                     {file.status === 'done' && <CheckCircle size={20} color="var(--success)" />}
                     {file.status === 'error' && <AlertCircle size={20} color="var(--error)" />}
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
};

export default FileList;
