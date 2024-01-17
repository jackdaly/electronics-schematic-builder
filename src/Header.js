import React from 'react';

const Header = ({ progress }) => {
  return (
    <header className="app-header">
      <button className="exit-button">X</button>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </header>
  );
};

export default Header;
