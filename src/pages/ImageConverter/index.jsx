import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import UnifiedDropZone from '../../components/UnifiedDropZone.jsx';
import { convertImage } from '../../utils/converter';
import { Settings, FileText, Zap, Loader2 } from 'lucide-react';
import clsx from 'clsx';

function ImageConverter() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  
  // Settings
  const [outputFormat, setOutputFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [targetSizeKB, setTargetSizeKB] = useState('');
  const [makePdf, setMakePdf] = useState(false);
  const [saveMode, setSaveMode] = useState('pdf_only'); // 'all' | 'pdf_only'
  const [pdfMode, setPdfMode] = useState('combined'); // 'combined' | 'separate'
  const [pdfPageSize, setPdfPageSize] = useState('a4'); // a4, letter, legal, a3, a5
  const [pdfName, setPdfName] = useState('converted_images.pdf');

  const handleFilesAdded = (newFiles) => {
    const fileObjs = newFiles.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      size: f.size,
      status: 'pending',
      blob: null,
      newSize: 0
    }));
    setFiles(prev => [...prev, ...fileObjs]);
  };

  const removeFile = (identifier) => {
    if (identifier === 'all') setFiles([]);
    else setFiles(prev => prev.filter(f => f.id !== identifier.id));
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    
    const convertedBlobs = [];
    const zip = new JSZip();

    setFiles(prev => prev.map(f => ({ ...f, status: f.status === 'done' ? 'done' : 'pending' })));

    // Process sequentially
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done') {
        convertedBlobs.push({ blob: files[i].blob, name: files[i].newName });
        continue;
      }

      setFiles(prev => {
        const copy = [...prev];
        copy[i].status = 'converting';
        return copy;
      });

      try {
        const result = await convertImage(files[i].file, outputFormat, quality, targetSizeKB ? parseInt(targetSizeKB) : null);
        
        setFiles(prev => {
          const copy = [...prev];
          copy[i].status = 'done';
          copy[i].blob = result.blob;
          copy[i].newSize = result.newSize;
          copy[i].newName = result.fileName;
          return copy;
        });

        convertedBlobs.push({ blob: result.blob, name: result.fileName });

        // Always add to ZIP if saveMode is 'all'
        if (saveMode === 'all') {
          zip.file(result.fileName, result.blob);
        }

      } catch (error) {
        setFiles(prev => {
           const copy = [...prev];
           copy[i].status = 'error';
           return copy;
        });
      }
    }

    // Generate PDF if enabled
    let pdfBlob = null;
    const separatePdfBlobs = [];
    
    if (makePdf && convertedBlobs.length > 0) {
       try {
         if (pdfMode === 'combined') {
           // Combined mode: One PDF with all images
           const doc = new jsPDF({ format: pdfPageSize, orientation: 'portrait' });
           for (let j = 0; j < convertedBlobs.length; j++) {
              if (j > 0) doc.addPage(pdfPageSize, 'portrait');
              const imgBlob = convertedBlobs[j].blob;
              const imgUrl = URL.createObjectURL(imgBlob);
              const imgProps = doc.getImageProperties(imgUrl);
              const pdfWidth = doc.internal.pageSize.getWidth();
              const pdfHeight = doc.internal.pageSize.getHeight();
               
              const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
              const w = imgProps.width * ratio;
              const h = imgProps.height * ratio;
              const x = (pdfWidth - w) / 2;
              const y = (pdfHeight - h) / 2;
              doc.addImage(imgUrl, 'JPEG', x, y, w, h);
              URL.revokeObjectURL(imgUrl);
           }
           pdfBlob = doc.output('blob');
         } else {
           // Separate mode: One PDF per image
           for (let j = 0; j < convertedBlobs.length; j++) {
              const doc = new jsPDF({ format: pdfPageSize, orientation: 'portrait' });
              const imgBlob = convertedBlobs[j].blob;
              const imgUrl = URL.createObjectURL(imgBlob);
              const imgProps = doc.getImageProperties(imgUrl);
              const pdfWidth = doc.internal.pageSize.getWidth();
              const pdfHeight = doc.internal.pageSize.getHeight();
               
              const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
              const w = imgProps.width * ratio;
              const h = imgProps.height * ratio;
              const x = (pdfWidth - w) / 2;
              const y = (pdfHeight - h) / 2;
              doc.addImage(imgUrl, 'JPEG', x, y, w, h);
              URL.revokeObjectURL(imgUrl);
              
              const singlePdfBlob = doc.output('blob');
              const pdfFileName = convertedBlobs[j].name.replace(/\.[^/.]+$/, '') + '.pdf';
              separatePdfBlobs.push({ blob: singlePdfBlob, name: pdfFileName });
           }
         }
       } catch (err) {
         console.error("PDF Error", err);
       }
    }

    // Handle downloads - always uses browser's default download folder
    if (saveMode === 'pdf_only') {
      // PDF Only mode
      if (pdfMode === 'combined' && pdfBlob) {
        saveAs(pdfBlob, pdfName);
      } else if (pdfMode === 'separate' && separatePdfBlobs.length > 0) {
        // Multiple separate PDFs - create ZIP
        const pdfZip = new JSZip();
        for (const pdf of separatePdfBlobs) {
          pdfZip.file(pdf.name, pdf.blob);
        }
        const content = await pdfZip.generateAsync({ type: "blob" });
        saveAs(content, "converted_pdfs.zip");
      }
    } else if (saveMode === 'all') {
      // All mode: create ZIP with images + PDF(s)
      if (pdfMode === 'combined' && pdfBlob) {
        zip.file(pdfName, pdfBlob);
      } else if (pdfMode === 'separate') {
        for (const pdf of separatePdfBlobs) {
          zip.file(pdf.name, pdf.blob);
        }
      }
      if (Object.keys(zip.files).length > 0) {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "converted_images.zip");
      }
    }

    setIsConverting(false);
  };

  return (
    <div className="image-converter-layout fade-in">
      <header className="app-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div className="header-title" style={{ justifyContent: 'center' }}>
          <Zap size={32} color="#6366f1" fill="#6366f1" fillOpacity={0.2} />
          Image Converter Pro
        </div>
        <p className="header-subtitle">Convert, resize, and merge images locally.</p>
      </header>

      <div className="converter-main-grid">
        {/* Left: Drop Zone */}
        <UnifiedDropZone 
          files={files} 
          setFiles={setFiles} 
          onFilesAdded={handleFilesAdded} 
          onRemove={removeFile} 
        />

        {/* Right: Settings */}
        <div className="settings-panel">
          <div className="glass-panel">
            <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', fontSize:'1.1rem', fontWeight:600 }}>
              <Settings size={20} color="var(--primary)" /> Conversion Settings
            </div>
            
            {/* Output Format Selector */}
            <div className="setting-group">
              <label className="setting-label">Output Format</label>
              <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={clsx(
                      "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                      outputFormat === fmt 
                        ? "bg-primary text-white shadow-lg" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {fmt.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quality Slider (Conditional) */}
            {outputFormat !== 'image/png' && (
              <div className="setting-group">
                <label className="setting-label flex justify-between">
                  <span>Image Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </label>
                <input 
                  type="range" 
                  min="0.1" max="1.0" step="0.05" 
                  value={quality} 
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="input-range"
                />
              </div>
            )}

            <div className="setting-group">
              <label className="setting-label">Target Max Size (KB) <span style={{fontWeight:400, opacity:0.7}}>(Optional)</span></label>
              <input 
                type="number"
                placeholder="e.g. 500"
                value={targetSizeKB}
                onChange={(e) => setTargetSizeKB(e.target.value)}
                className="input-text"
              />
            </div>

            <div className="setting-group" style={{ marginBottom: 0 }}>
              <div className="flex justify-between items-center bg-gray-800 bg-opacity-30 p-3 rounded-lg border border-gray-700">
                <div className="flex gap-3 items-center">
                  <FileText size={24} color={makePdf ? "var(--secondary)" : "var(--text-muted)"} />
                  <div>
                    <div style={{ fontWeight: 500 }}>Combine to PDF</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Merge all into one document</div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={makePdf} onChange={(e) => setMakePdf(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              {makePdf && (
                <div className="mt-3 pl-2 space-y-3 animated-enter">
                  <div>
                    <label className="setting-label" style={{ marginBottom: '0.5rem', display: 'block' }}>PDF Page Size</label>
                    <select
                      value={pdfPageSize}
                      onChange={(e) => setPdfPageSize(e.target.value)}
                      className="input-text"
                      style={{ padding: '0.5rem 0.75rem' }}
                    >
                      <option value="a4">A4 (210 × 297 mm)</option>
                      <option value="letter">Letter (8.5 × 11 in)</option>
                      <option value="legal">Legal (8.5 × 14 in)</option>
                      <option value="a3">A3 (297 × 420 mm)</option>
                      <option value="a5">A5 (148 × 210 mm)</option>
                    </select>
                  </div>

                  <div className="save-options">
                    <label className="setting-label" style={{ marginBottom: '0.5rem', display: 'block' }}>PDF Mode</label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="pdfMode" 
                        value="combined" 
                        checked={pdfMode === 'combined'} 
                        onChange={() => setPdfMode('combined')} 
                      />
                      <span className="radio-label">One PDF (All Images Combined)</span>
                    </label>
                    
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="pdfMode" 
                        value="separate" 
                        checked={pdfMode === 'separate'} 
                        onChange={() => setPdfMode('separate')} 
                      />
                      <span className="radio-label">Separate PDFs (One Per Image)</span>
                    </label>
                  </div>

                  <div className="save-options">
                    <label className="setting-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Save Options</label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="saveMode" 
                        value="all" 
                        checked={saveMode === 'all'} 
                        onChange={() => setSaveMode('all')} 
                      />
                      <span className="radio-label">Save Converted Images + PDF(s) (ZIP)</span>
                    </label>
                    
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="saveMode" 
                        value="pdf_only" 
                        checked={saveMode === 'pdf_only'} 
                        onChange={() => setSaveMode('pdf_only')} 
                      />
                      <span className="radio-label">Save PDF(s) Only</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <button 
              onClick={processFiles}
              disabled={isConverting}
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
            >
              {isConverting ? (
                <><Loader2 className="animate-spin" /> Converting...</>
              ) : (
                <><Zap fill="currentColor" /> Start Conversion</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageConverter;
