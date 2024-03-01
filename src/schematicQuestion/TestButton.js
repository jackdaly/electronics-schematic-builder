import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import "./TestButton.css";

const TestButton = ({
  onTest,
  answerState,
  setAnswerState,
  questions,
  currentQuestionIndex,
  AnswerMsg
}) => {
  const navigate = useNavigate();
  const buttonstyle = () => {
    // Base styles that should always be applied
    let baseStyle = {};

    // Append properties based on the answer state
    switch (answerState) {
      case "correct":
        return {
          ...baseStyle,
          backgroundColor: "#7BC625",
          boxShadow: "0 5px #5BA61C",
          color: "white",
        };
      case "incorrect":
        return {
          ...baseStyle,
          backgroundColor: "#FD4D50",
          boxShadow: "0 5px #E72E33",
          color: "white",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#FFC300",
          boxShadow: "0 5px #FFB020",
          color: "white",
        };
    }
  };

  useEffect(() => {
    console.log(`RESETTING TEST BUTTON`);
    setAnswerState([]);
  }, [currentQuestionIndex]); // Dependency array, effect runs when answerState changes
  

  // Handler for refreshing the page
  const refreshPage = () => {
    window.location.reload();
  };

  // Determine the onClick handler based on the answer state
  const handleOnClick = () => {
    // Log the state to debug
    console.log("Button clicked");
    console.log("Answer State:", answerState);
    console.log("AnswerMsg:", AnswerMsg);
    console.log("Current Question Index:", currentQuestionIndex);
    console.log("Questions:", questions);
    console.log("Total Questions:", questions.length);

    if (answerState === "correct" || answerState === "incorrect") {
      console.log("Check if final Q");
      // If the answer is correct, navigate to the next question or end page
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < questions.length) {
        console.log("Go to next Q",`/schematic-question/${questions[nextQuestionIndex].id}`);
        // There are more questions, go to the next one
        navigate(`/schematic-question/${questions[nextQuestionIndex].id}`, {
          state: {
            questionsData: questions,
            currentQuestionIndex: nextQuestionIndex, // Start with the first question
          },
        });
      } else {
        console.log("No more questions");
        // No more questions, go to the end page
        navigate("/EndPage");
      }
    }
    // else if (answerState === "incorrect") {
    //   // If the answer is incorrect, retest the current question or handle accordingly
    //   onTest();
    // }
    else {
      console.log("No answer state", answerState);
      // If no answer state, likely the first test attempt
      onTest();
    }
  };

  return (
    <button
      className="test-button"
      style={buttonstyle()}
      onClick={handleOnClick}
    >
      {!answerState.length && <h3>Test</h3>}
      {answerState === "correct" && <h3>Continue</h3>}
      {answerState === "incorrect" && <h3>Continue</h3>}
    </button>
  );
};

export default TestButton;
