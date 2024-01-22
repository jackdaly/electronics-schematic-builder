import React from 'react';

import { useNavigate } from 'react-router-dom';

import './TestButton.css';


const TestButton = ({ onTest,answerState, setAnswerState  }) => {
  const navigate = useNavigate();
  
  const buttonstyle = () => {
    // Base styles that should always be applied
    let baseStyle = {

    };

    // Append properties based on the answer state
    switch (answerState) {
      case "correct":
        return { ...baseStyle, backgroundColor: "#7BC625", boxShadow: "0 5px #5BA61C", color: "white" };
      case "incorrect":
        return { ...baseStyle, backgroundColor: "#FD4D50",boxShadow: "0 5px #E72E33", color: "white" };
      default:
        return { ...baseStyle, backgroundColor: "#FFC300", boxShadow: "0 5px #FFB020", color: "white" };
    }
  };

    // Handler for refreshing the page
    const refreshPage = () => {
      window.location.reload();
    };
  
    // Determine the onClick handler based on the answer state
    const handleOnClick = () => {
      if (answerState === "correct" || answerState === "incorrect") {
        navigate('/EndPage');
      } else {
        onTest();
      }
    };
  

  return <button className="test-button" style={buttonstyle()} onClick={handleOnClick}>
    {!answerState.length &&
    <h3>Test</h3>}
    {answerState === "correct" && <h3>Continue</h3>}
    {answerState === "incorrect" && <h3>Continue</h3>}

    
    </button>;
};

export default TestButton;
