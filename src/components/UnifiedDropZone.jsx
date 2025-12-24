import React, { useState, useRef } from 'react';
import { Reorder } from 'framer-motion';
import { Upload, Folder, FileImage, GripVertical, X, CheckCircle, Loader2, AlertCircle, ArrowUpDown, Trash2 } from 'lucide-react';

const UnifiedDropZone = ({ files, setFiles, onFilesAdded, onRemove }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      onFilesAdded(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (selectedFiles.length > 0) {
      onFilesAdded(selectedFiles);
    }
    e.target.value = null;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSort = () => {
    const sorted = [...files].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    setFiles(sorted);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircle size={16} className="text-success" style={{ color: 'var(--success)' }} />;
      case 'converting':
        return <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />;
      case 'error':
        return <AlertCircle size={16} style={{ color: 'var(--error)' }} />;
      default:
        return <FileImage size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div
      className={`unified-drop-zone ${isDragOver ? 'drag-over' : ''} ${files.length > 0 ? 'has-files' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden Inputs */}
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        multiple
        accept="image/*"
        webkitdirectory="true"
        className="hidden"
        ref={folderInputRef}
        onChange={handleFileSelect}
      />

      {files.length === 0 ? (
        /* Empty State */
        <div className="drop-zone-empty">
          <Upload className="drop-zone-icon" />
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Drag & Drop Images</h3>
            <p style={{ color: 'var(--text-muted)' }}>JPG, PNG, BMP, WEBP supported</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <FileImage size={18} /> Pick Files
            </button>
            <button className="btn btn-secondary" onClick={() => folderInputRef.current?.click()}>
              <Folder size={18} /> Pick Folder
            </button>
          </div>
        </div>
      ) : (
        /* File List with Reorder */
        <div className="drop-zone-with-files">
          {/* Header */}
          <div className="files-header">
            <span className="files-count">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            <div className="files-actions">
              <button className="btn-icon" onClick={handleSort} title="Sort by Name">
                <ArrowUpDown size={16} />
              </button>
              <button className="btn-icon" onClick={() => onRemove('all')} title="Clear All">
                <Trash2 size={16} />
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} /> Add More
              </button>
            </div>
          </div>

          {/* Draggable List */}
          <Reorder.Group axis="y" values={files} onReorder={setFiles} className="files-list">
            {files.map((file) => (
              <Reorder.Item key={file.id} value={file} className="file-item-drag">
                <GripVertical size={16} style={{ cursor: 'grab', color: 'var(--text-muted)' }} />
                {getStatusIcon(file.status)}
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span>{formatSize(file.size)}</span>
                    {file.status === 'done' && file.newSize > 0 && (
                      <>
                        <span>→</span>
                        <span style={{ color: 'var(--success)' }}>{formatSize(file.newSize)}</span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  className="btn-icon" 
                  onClick={(e) => { e.stopPropagation(); onRemove(file); }}
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Drop Hint */}
          <div className="drop-hint">
            <Upload size={14} /> Drop more files here
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDropZone;
