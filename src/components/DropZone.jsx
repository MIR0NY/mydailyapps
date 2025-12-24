import React, { useRef, useState } from 'react';
import { Upload, FolderPlus, FileImage } from 'lucide-react';

const DropZone = ({ onFilesAdded }) => {
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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesAdded(files);
    }
    e.target.value = null; // Reset
  };

  return (
    <div
      className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
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
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Drag & Drop Images</h3>
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
  );
};

export default DropZone;
