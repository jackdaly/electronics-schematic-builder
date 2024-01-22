import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css"; // Make sure to create a corresponding CSS file

const EndPage = ({ onGetStarted }) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // Hook to navigate

  const handleClick = (event) => {
    event.preventDefault();
    window.location.replace("https://forms.gle/HTAKfRKvpYEFzL4k6");
    //navigate('https://forms.gle/HTAKfRKvpYEFzL4k6'); // Navigate to the schematic question page
  };

  return (
    <div className="welcome-container">
      <div>PlayMicro</div>
      <div className="container">
        <img src="/assets/EndPage.png"  className="image-responsive" alt="End Page Graphic"></img>
        <h1>Well done! Thank you</h1>
        <p>
          I would be honoured to learn more about how I can tailor this to your
          needs, fix any bugs and implement further features! Let me know in the short 2 minute form below!
        </p>
        <button onClick={handleClick}>I would love to help!</button>
      </div>
      <footer>
        <p>Are you a React developer?</p>
        <a href="https://github.com/jackdaly/electronics-schematic-builder">
        Contribute to the github here
        </a>
      </footer>
    </div>
  );
};

export default EndPage;
