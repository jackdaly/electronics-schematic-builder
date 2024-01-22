// Using top-level await and dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/17684077/3ga5ynn/';

const sendEmailToZapier = async (email) => {
  const response = await fetch(ZAPIER_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    // It's good practice to log the response for debugging purposes
    const errorBody = await response.text();
    console.error('Error response from Zapier:', errorBody);
    throw new Error('Failed to send email to Zapier');
  }
};

export default async function sendEmail(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      const zapierResponse = await sendEmailToZapier(email);
      // Optionally process zapierResponse if needed
      return res.status(200).json({ message: 'Email sent successfully to Zapier', zapierResponse });
    } catch (error) {
      console.error('Error sending email to Zapier:', error);
      return res.status(500).json({ message: 'Failed to send email to Zapier', error: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
