import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css'; // Make sure to create a corresponding CSS file

const WelcomePage = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // Hook to navigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('https://hooks.zapier.com/hooks/catch/17684077/3ga5ynn/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        console.log('Email sent to Zapier');
        // Here you can navigate to another page or show a success message
      } else {
        console.error('Failed to send email to Zapier');
      }
    } catch (error) {
      console.error('Error sending email to Zapier', error);
    }


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
