export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contents, systemInstruction, generationConfig } = req.body;
    
    // Read the secret key from environment variables on Vercel or headers
    const apiKeysRaw = process.env.GEMINI_API_KEY || req.headers['x-api-key'];

    if (!apiKeysRaw) {
      return res.status(400).json({ error: 'Gemini API Key is missing. Please set GEMINI_API_KEY environment variable on Vercel.' });
    }

    // Split comma-separated keys
    const apiKeys = apiKeysRaw.split(',').map(k => k.trim()).filter(Boolean);
    
    let lastError = null;
    let data = null;
    let success = false;

    // Loop through keys until one works (Rotation)
    for (const key of apiKeys) {
      try {
        console.log(`[API Chat] Attempting Gemini request with key ending in ...${key.slice(-6)}`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction,
            generationConfig
          })
        });

        if (response.ok) {
          data = await response.json();
          success = true;
          console.log(`[API Chat] Request succeeded with key ending in ...${key.slice(-6)}`);
          break;
        } else {
          const errText = await response.text();
          console.warn(`[API Chat] Key ...${key.slice(-6)} failed: status ${response.status} - ${errText}`);
          lastError = `Status ${response.status} - ${errText}`;
        }
      } catch (err) {
        console.warn(`[API Chat] Connection error for key ...${key.slice(-6)}: ${err.message}`);
        lastError = err.message;
      }
    }

    if (!success) {
      return res.status(502).json({ error: `All provided Gemini API Keys failed. Last error: ${lastError}` });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[API Chat] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
