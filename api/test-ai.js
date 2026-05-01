// Test endpoint for debugging AI integration
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug environment variables
    const envVars = {
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY ? `configured (${process.env.MISTRAL_API_KEY.length} chars)` : 'NOT CONFIGURED',
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      VERCEL_ENV: process.env.VERCEL_ENV || 'undefined',
      VERCEL_REGION: process.env.VERCEL_REGION || 'undefined'
    };

    console.log('🔍 Debug - Environment Variables:', envVars);

    // Test Mistral API connection
    let mistralTest = { status: 'not_tested', error: null };
    
    if (process.env.MISTRAL_API_KEY) {
      try {
        const { Mistral } = await import('@mistralai/mistralai');
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        
        // Simple test request
        const response = await mistral.chat.complete({
          model: "mistral-tiny",
          messages: [{ role: 'user', content: 'Say "Hello from Mistral!"' }],
          maxTokens: 10
        });

        mistralTest = {
          status: 'success',
          response: response.choices?.[0]?.message?.content || 'no response',
          model: response.model || 'unknown'
        };

        console.log('✅ Mistral API test successful:', mistralTest);

      } catch (error) {
        mistralTest = {
          status: 'error',
          error: error.message,
          stack: error.stack
        };

        console.error('❌ Mistral API test failed:', error);
      }
    }

    // Return comprehensive debug info
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: envVars,
      mistral_test: mistralTest,
      request_info: {
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers.host,
          'user-agent': req.headers['user-agent'],
          'x-vercel-forwarded-for': req.headers['x-vercel-forwarded-for']
        }
      }
    });

  } catch (error) {
    console.error('🚨 Test endpoint error:', error);
    return res.status(500).json({
      error: 'Test endpoint failed',
      details: error.message,
      stack: error.stack
    });
  }
}
