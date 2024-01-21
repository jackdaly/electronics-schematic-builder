import React from 'react';
import './Header.css';

const Header = ({ progress }) => {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <header className="app-header">
      <button className="exit-button" onClick={refreshPage}><i className="fas fa-undo" style={{fontSize:'24px'}}></i> {/* Font Awesome times icon */}</button>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </header>
  );
};

export default Header;
