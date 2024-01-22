import fetch from 'node-fetch'; // Ensure you have 'node-fetch' installed if you're using Node < 18

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/17684077/3ga5ynn/'; // Replace with your Zapier webhook URL

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
    throw new Error('Failed to send email to Zapier');
  }
};

const sendEmail = async (req, res) => {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      const zapierResponse = await sendEmailToZapier(email);
      // Optionally process zapierResponse if needed
      return res.status(200).send({ message: 'Email sent successfully to Zapier' });
    } catch (error) {
      console.error('Error sending email to Zapier:', error);
      return res.status(500).send({ message: 'Failed to send email to Zapier' });
    }
  }

  // Handle any other HTTP methods
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default sendEmail;
