import React from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Type, Wrench, Zap } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="app-navbar">
      <div className="navbar-brand">
        <Zap size={28} color="#6366f1" fill="#6366f1" fillOpacity={0.3} />
        <span>Daily Tools</span>
      </div>
      
      <div className="navbar-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Image size={18} />
          <span>Image Converter</span>
        </NavLink>
        
        <NavLink 
          to="/text-converter" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Type size={18} />
          <span>Bijoy ↔ Unicode</span>
        </NavLink>
      </div>
      
      <div className="navbar-badge">
        <Wrench size={14} />
        <span>v1.0</span>
      </div>
    </nav>
  );
};

export default Navbar;
