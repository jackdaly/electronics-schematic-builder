// api/fetchCourseData.js
const axios = require('axios');
const pat = process.env.AIRTABLE_PAT; // Make sure this is the correct environment variable name for your API key
const baseId = process.env.AIRTABLE_BASE_ID;

module.exports = async (req, res) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Fetch the course records, including the lookup fields for questions
    const airtableResponse = await axios.get(`https://api.airtable.com/v0/${baseId}/Course?view=Grid%20view`, config);
    
    // Map through the records and get the necessary details
    const coursesData = airtableResponse.data.records.map(course => {
      // Assuming 'Questions', 'Id (from Questions)', 'Question (from Questions)', 'Answer (from Questions)',
      // 'Question Type (from Questions)', and 'Components (from Questions)' are the names of the lookup fields
      return {
        id: course.id,
        name: course.fields.Name,
        description: course.fields.Description,
        questions: (course.fields['Questions'] || []).map((questionId, index) => {
          // Map each question ID to the corresponding lookup data
          return {
            id: questionId,
            question: course.fields['Question (from Questions)'][index],
            answer: course.fields['Answer (from Questions)'][index],
            questionType: course.fields['Question Type (from Questions)'][index],
            components: course.fields['Components (from Questions)'][index],
            // Add additional fields as necessary
          };
        }),
      };
    });

    // Respond with the mapped data which includes the courses and their related questions
    res.status(200).json(coursesData);
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    if (error.response) {
      res.status(error.response.status).json({ message: 'Failed to fetch data', details: error.response.data });
    } else if (error.request) {
      res.status(500).json({ message: 'No response received', details: error.message });
    } else {
      res.status(500).json({ message: 'Error setting up request', details: error.message });
    }
  }
};
