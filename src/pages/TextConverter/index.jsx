import React, { useState, useEffect } from 'react';
import { unicodeToBijoy, bijoyToUnicode } from '../../utils/textConverter';
import { ArrowLeftRight, Copy, Trash2, Download, History, X, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'text_converter_data';

const TextConverter = () => {
  const [unicodeText, setUnicodeText] = useState('');
  const [bijoyText, setBijoyText] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showFontNotice, setShowFontNotice] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnicodeText(data.unicodeText || '');
        setBijoyText(data.bijoyText || '');
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
    // Check if font notice was dismissed
    if (localStorage.getItem('bijoy_font_notice_dismissed') === 'true') {
      setShowFontNotice(false);
    }
  }, []);

  // Save to localStorage
  const saveData = (unicode, bijoy) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      unicodeText: unicode,
      bijoyText: bijoy,
      lastSaved: new Date().toISOString()
    }));
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const dismissFontNotice = () => {
    setShowFontNotice(false);
    localStorage.setItem('bijoy_font_notice_dismissed', 'true');
  };

  const handleConvertToBijoy = () => {
    if (!unicodeText.trim()) {
      showToast('Please enter Unicode text first');
      return;
    }
    const result = unicodeToBijoy(unicodeText);
    setBijoyText(result);
    saveData(unicodeText, result);
    showToast('✓ Converted to Bijoy!');
  };

  const handleConvertToUnicode = () => {
    if (!bijoyText.trim()) {
      showToast('Please enter Bijoy text first');
      return;
    }
    const result = bijoyToUnicode(bijoyText);
    setUnicodeText(result);
    saveData(result, bijoyText);
    showToast('✓ Converted to Unicode!');
  };

  const copyText = async (text, label) => {
    if (!text) {
      showToast(`No ${label} text to copy`);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast(`✓ ${label} text copied!`);
    } catch (e) {
      showToast('Failed to copy');
    }
  };

  const downloadText = (text, filename) => {
    if (!text) {
      showToast('No text to download');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded!');
  };

  const clearAll = () => {
    setUnicodeText('');
    setBijoyText('');
    localStorage.removeItem(STORAGE_KEY);
    showToast('Cleared all text');
  };

  return (
    <div className="text-converter-page fade-in">
      {/* Toast */}
      {toast.show && (
        <div className="toast-notification">
          {toast.message}
        </div>
      )}

      {/* Font Notice */}
      {showFontNotice && (
        <div className="font-notice">
          <AlertTriangle size={18} />
          <span>
            <strong>Font Required:</strong> Bijoy text needs <strong>SutonnyMJ</strong> font to display correctly. 
            Copy the converted text and paste it in MS Word or any software with SutonnyMJ font installed.
          </span>
          <button onClick={dismissFontNotice} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="converter-vertical">
        {/* Unicode Panel */}
        <div className="converter-panel">
          <div className="panel-header">
            <h3>Unicode (বাংলা)</h3>
            <div className="panel-actions">
              <button onClick={() => copyText(unicodeText, 'Unicode')} title="Copy">
                <Copy size={16} />
              </button>
              <button onClick={() => setUnicodeText('')} title="Clear">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <textarea
            value={unicodeText}
            onChange={(e) => setUnicodeText(e.target.value)}
            placeholder="পেস্ট করুন বা টাইপ করুন..."
            className="converter-textarea unicode-font"
          />
          <div className="char-count">{unicodeText.length.toLocaleString()} characters</div>
        </div>

        {/* Conversion Buttons - Horizontal Row */}
        <div className="converter-buttons-row">
          <button className="convert-btn wide" onClick={handleConvertToBijoy} title="Unicode → Bijoy">
            <span>Unicode</span>
            <ArrowLeftRight size={20} />
            <span>Bijoy</span>
          </button>
          <button className="convert-btn wide reverse" onClick={handleConvertToUnicode} title="Bijoy → Unicode">
            <span>Bijoy</span>
            <ArrowLeftRight size={20} />
            <span>Unicode</span>
          </button>
        </div>

        {/* Bijoy Panel */}
        <div className="converter-panel">
          <div className="panel-header">
            <h3>Bijoy</h3>
            <div className="panel-actions">
              <button onClick={() => copyText(bijoyText, 'Bijoy')} title="Copy">
                <Copy size={16} />
              </button>
              <button onClick={() => downloadText(bijoyText, 'bijoy-text.txt')} title="Download">
                <Download size={16} />
              </button>
              <button onClick={() => setBijoyText('')} title="Clear">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <textarea
            value={bijoyText}
            onChange={(e) => setBijoyText(e.target.value)}
            placeholder="Converted text will appear here..."
            className="converter-textarea bijoy-font"
          />
          <div className="char-count">{bijoyText.length.toLocaleString()} characters</div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <button className="action-btn danger" onClick={clearAll}>
          <Trash2 size={16} /> Clear All
        </button>
      </div>
    </div>
  );
};

export default TextConverter;
