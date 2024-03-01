// api/GetCourseQuestions.js

const axios = require('axios');
const pat = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

module.exports = async (req, res) => {
  const courseId = req.query.courseId;
  const config = {
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Fetch the course record, which now includes all lookup fields from the Questions table
    const courseResponse = await axios.get(`https://api.airtable.com/v0/${baseId}/Course/${courseId}`, config);
    const courseData = courseResponse.data;
    
    // Check if the course has linked questions
    if (courseData.fields && courseData.fields.Questions) {
      // Return the course data with all the lookup fields
      res.status(200).json(courseData);
    } else {
      res.status(404).json({ message: 'No questions found for this course' });
    }
  } catch (error) {
    console.error('Error fetching course with questions from Airtable:', error);
    res.status(500).json({ message: 'Failed to fetch course with questions', details: error.response ? error.response.data : error.message });
  }
};
