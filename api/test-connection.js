const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  // Enable CORS for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from server environment (not exposed to frontend)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // Test the connection with a simple request
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, this is a test message.',
    });

    res.status(200).json({ 
      connected: true, 
      message: 'Gemini API connection successful' 
    });
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    res.status(500).json({ 
      connected: false, 
      error: 'Failed to connect to Gemini API' 
    });
  }
}; 