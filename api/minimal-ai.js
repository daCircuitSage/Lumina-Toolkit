// Minimal AI endpoint for debugging - no dependencies on other code
export default async function handler(req, res) {
  console.log('=== MINIMAL AI DEBUG START ===');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Step 1: Check environment variable
    const apiKey = process.env.MISTRAL_API_KEY;
    console.log('Step 1 - API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      type: typeof apiKey
    });

    if (!apiKey) {
      console.error('❌ NO API KEY FOUND');
      return res.status(500).json({ 
        error: 'MISTRAL_API_KEY not found in environment',
        debug: {
          envVars: Object.keys(process.env).filter(k => k.includes('MISTRAL')),
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        }
      });
    }

    // Step 2: Import Mistral
    console.log('Step 2 - Importing Mistral...');
    let Mistral;
    try {
      const mistralModule = await import('@mistralai/mistralai');
      Mistral = mistralModule.Mistral;
      console.log('✅ Mistral imported successfully');
    } catch (importError) {
      console.error('❌ Mistral import failed:', importError);
      return res.status(500).json({ 
        error: 'Failed to import Mistral SDK',
        details: importError.message
      });
    }

    // Step 3: Create client
    console.log('Step 3 - Creating Mistral client...');
    let mistral;
    try {
      mistral = new Mistral({ apiKey });
      console.log('✅ Mistral client created');
    } catch (clientError) {
      console.error('❌ Mistral client creation failed:', clientError);
      return res.status(500).json({ 
        error: 'Failed to create Mistral client',
        details: clientError.message
      });
    }

    // Step 4: Make API call
    console.log('Step 4 - Making API call...');
    let response;
    try {
      response = await mistral.chat.complete({
        model: "mistral-tiny", // Use smallest model for testing
        messages: [{ 
          role: 'user', 
          content: 'Reply with just: "Hello from Mistral!"' 
        }],
        maxTokens: 20
      });
      console.log('✅ API call successful');
    } catch (apiError) {
      console.error('❌ API call failed:', {
        message: apiError.message,
        status: apiError.status,
        response: apiError.response?.data
      });
      return res.status(500).json({ 
        error: 'Mistral API call failed',
        details: apiError.message,
        status: apiError.status,
        response: apiError.response?.data
      });
    }

    // Step 5: Process response
    const result = response.choices?.[0]?.message?.content || 'No response content';
    console.log('Step 5 - Response processed:', result);

    const successResponse = {
      success: true,
      message: result,
      debug: {
        model: response.model,
        usage: response.usage,
        id: response.id,
        timestamp: new Date().toISOString()
      }
    };

    console.log('=== MINIMAL AI DEBUG SUCCESS ===');
    return res.json(successResponse);

  } catch (error) {
    console.error('=== MINIMAL AI DEBUG ERROR ===', error);
    return res.status(500).json({
      error: 'Unexpected error in minimal AI endpoint',
      details: error.message,
      stack: error.stack
    });
  }
}
