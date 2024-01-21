import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css'; // Make sure to create a corresponding CSS file

const WelcomePage = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // Hook to navigate

  const handleSubmit = (event) => {
    event.preventDefault();
    // You might want to do something with the email, like saving it or sending it to an API
    navigate('/schematic-question'); // Navigate to the schematic question page
  };

  return (
    <div className="welcome-container">
      <div>
        PlayMicro
      </div>
      <div>
      <h1>Hi there!</h1>
      <p>Welcome to the first test of PlayMicro.<br />Thank you for testing it out!</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Me@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Let's get started</button>
      </form>
      </div>
      <footer>
        <p>By Jack Daly</p>
        <a href="mailto:jackdaly@playmicrocade.com">Send your feedback here!</a>
      </footer>
    </div>
  );
};

export default WelcomePage;
