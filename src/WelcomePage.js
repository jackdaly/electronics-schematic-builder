import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';
import axios from 'axios';

const WelcomePage = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get('/api/fetchCourseData');
        console.log('API Response:', response.data);
  
        if (response.data && response.data.length > 0) {
          // Process each course
          response.data.forEach(course => {
            console.log(`Course Name: ${course.name}`);
            console.log(`Course Description: ${course.description}`);
            if (course.questions && course.questions.length > 0) {
              // Log each question field
              course.questions.forEach(question => {
                console.log(`Question ID: ${question.id}`);
                console.log(`Question: ${question.question}`);
                console.log(`Answer: ${question.answer}`);
                console.log(`Question Type: ${question.questionType}`);
                console.log(`Components: ${JSON.stringify(question.components)}`);
              });
            }
          });
          setCourses(response.data);
        } else {
          console.error("No course records found in the response.");
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        console.log('Full Error:', error.response || error);
      }
    };
  
    fetchCourseData();
  }, []);
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    //Handle Email
    try {
      const response = await fetch('../api/send-email', { // Make sure this matches your Vercel serverless function endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }), // Ensure that 'email' is defined in your component's state
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Email sent:', data.message);
        // Navigate to another page or show success message
      } else {
        console.error('Failed to send email:', response.statusText);
        // Handle errors, maybe set an error message in state and display to user
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Handle errors, maybe set an error message in state and display to user
    }
  // Handle Course Link

    // Handle Course Navigation
  const defaultCourseIndex = 0; // Assuming the first course is the default one
  if (courses.length > 0) {
    const selectedCourse = courses[defaultCourseIndex]; // Get the default course
    const questionsData = selectedCourse.questions; // Directly access the questions from the selected course

    if (questionsData && questionsData.length > 0) {
      navigate(`/schematic-question/${questionsData[0].id}`, {
        state: { 
          questionsData: questionsData,
          currentQuestionIndex: 0 // Start with the first question
        }
      });
      
      console.log("State passed on to schematic-question page");
    } else {
      console.error("No questions data available for this course.");
    }
  } else {
    console.error("No courses available.");
  }
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
        <a href="https://forms.gle/HTAKfRKvpYEFzL4k6">Send your feedback here!</a>
      </footer>
    </div>
  );
};

export default WelcomePage;
