import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import ImageConverter from './pages/ImageConverter';
import TextConverter from './pages/TextConverter';

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ImageConverter />} />
            <Route path="/text-converter" element={<TextConverter />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
