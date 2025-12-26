import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { 
  Upload, FolderPlus, FileImage, GripVertical, X, 
  CheckCircle, AlertCircle, Loader2, Trash2, ArrowUpDown 
} from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Memoized file item to prevent unnecessary re-renders
const FileItem = React.memo(({ file, onRemove }) => (
  <div className="file-item" style={{ cursor: 'grab' }}>
    <div className="text-slate-600 mr-2" style={{ cursor: 'grab' }}>
      <GripVertical size={16} />
    </div>
    
    <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', display: 'flex' }}>
      <FileImage size={20} color="#818cf8" />
    </div>
    
    <div className="file-info">
      <div className="file-name">{file.name}</div>
      <div className="file-meta">
        <span>{formatSize(file.size)}</span>
        {file.status === 'done' && (
          <>
            <span>•</span>
            <span style={{ color: 'var(--success)' }}>→ {formatSize(file.newSize)}</span>
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
      {file.status === 'converting' && <Loader2 className="animate-spin" size={20} color="#818cf8" />}
      {file.status === 'done' && <CheckCircle size={20} color="var(--success)" />}
      {file.status === 'error' && <AlertCircle size={20} color="var(--error)" />}
    </div>
  </div>
));

FileItem.displayName = 'FileItem';

const UnifiedDropZone = ({ files, setFiles, onFilesAdded, onRemove }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      onFilesAdded(droppedFiles);
    }
  }, [onFilesAdded]);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (selectedFiles.length > 0) {
      onFilesAdded(selectedFiles);
    }
    e.target.value = null;
  }, [onFilesAdded]);

  // Optimized sort function - sorts by filename without extension
  const handleSort = useCallback(() => {
    setFiles(prev => {
      const sorted = [...prev].sort((a, b) => {
        // Remove extension for comparison
        const nameA = a.name.replace(/\.[^/.]+$/, '');
        const nameB = b.name.replace(/\.[^/.]+$/, '');
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });
      return sorted;
    });
  }, [setFiles]);

  const handleClearAll = useCallback(() => {
    onRemove('all');
  }, [onRemove]);

  // Optimized reorder handler - batched state update
  const handleReorder = useCallback((newOrder) => {
    setFiles(newOrder);
  }, [setFiles]);

  const hasFiles = files && files.length > 0;

  return (
    <div className="unified-dropzone glass-panel">
      {/* Drop Zone Area */}
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${hasFiles ? 'compact' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
          webkitdirectory=""
          className="hidden"
          ref={folderInputRef}
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center">
          <Upload className="drop-zone-icon" />
          
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {hasFiles ? 'Add More Images' : 'Drag & Drop Images'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>JPG, PNG, BMP, WEBP supported</p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
              className="btn btn-secondary"
            >
              <FileImage size={16} /> Pick Files
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); folderInputRef.current.click(); }}
              className="btn btn-secondary"
            >
              <FolderPlus size={16} /> Pick Folder
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      {hasFiles && (
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
                onClick={handleClearAll} 
                className="btn-icon"
                title="Clear All"
                style={{ borderRadius: '4px', padding: '4px 8px', gap: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
          
          <div className="file-list-scroll custom-scrollbar">
            <Reorder.Group 
              axis="y" 
              values={files} 
              onReorder={handleReorder} 
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
              layoutScroll
            >
              <AnimatePresence initial={false} mode="popLayout">
                {files.map((file) => (
                  <Reorder.Item 
                    key={file.id} 
                    value={file}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'relative' }}
                    layout="position"
                  >
                    <FileItem file={file} onRemove={onRemove} />
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDropZone;
