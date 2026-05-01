// Enhanced Vercel debugging endpoint
export default async function handler(req, res) {
  console.log('🚀 DEBUG VERCEL - Request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

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
    // 1. Environment Variables Check
    const envCheck = {
      MISTRAL_API_KEY: {
        exists: !!process.env.MISTRAL_API_KEY,
        length: process.env.MISTRAL_API_KEY?.length || 0,
        prefix: process.env.MISTRAL_API_KEY?.substring(0, 8) + '...' || 'undefined',
        type: typeof process.env.MISTRAL_API_KEY
      },
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      VERCEL_ENV: process.env.VERCEL_ENV || 'undefined',
      VERCEL_REGION: process.env.VERCEL_REGION || 'undefined',
      VERCEL_URL: process.env.VERCEL_URL || 'undefined'
    };

    console.log('🔍 ENV CHECK:', envCheck);

    // 2. Module Import Test
    let moduleTest = { status: 'not_tested' };
    try {
      const { Mistral } = await import('@mistralai/mistralai');
      moduleTest = {
        status: 'success',
        MistralClass: typeof Mistral,
        MistralExists: !!Mistral
      };
      console.log('✅ Module import successful');
    } catch (moduleError) {
      moduleTest = {
        status: 'error',
        error: moduleError.message,
        stack: moduleError.stack
      };
      console.error('❌ Module import failed:', moduleError);
    }

    // 3. Mistral Client Initialization Test
    let clientTest = { status: 'not_tested' };
    if (moduleTest.status === 'success' && envCheck.MISTRAL_API_KEY.exists) {
      try {
        const { Mistral } = await import('@mistralai/mistralai');
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        clientTest = {
          status: 'success',
          clientCreated: !!mistral,
          clientType: typeof mistral
        };
        console.log('✅ Mistral client created successfully');
      } catch (clientError) {
        clientTest = {
          status: 'error',
          error: clientError.message,
          stack: clientError.stack
        };
        console.error('❌ Mistral client creation failed:', clientError);
      }
    }

    // 4. Simple API Call Test
    let apiTest = { status: 'not_tested' };
    if (clientTest.status === 'success') {
      try {
        const { Mistral } = await import('@mistralai/mistralai');
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        
        console.log('🤖 Testing Mistral API call...');
        const response = await mistral.chat.complete({
          model: "mistral-tiny",
          messages: [{ role: 'user', content: 'Say "Hello from Vercel!"' }],
          maxTokens: 10
        });

        apiTest = {
          status: 'success',
          response: response.choices?.[0]?.message?.content || 'no response',
          model: response.model || 'unknown',
          usage: response.usage || 'no usage data',
          id: response.id || 'no id'
        };
        console.log('✅ Mistral API call successful:', apiTest);
      } catch (apiError) {
        apiTest = {
          status: 'error',
          error: apiError.message,
          stack: apiError.stack,
          response: apiError.response?.data || 'no response data'
        };
        console.error('❌ Mistral API call failed:', apiError);
      }
    }

    // 5. Runtime Environment Check
    const runtimeCheck = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };

    // 6. Network/Fetch Test
    let networkTest = { status: 'not_tested' };
    try {
      const testResponse = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { 'User-Agent': 'Vercel-Debug-Test' }
      });
      const testData = await testResponse.json();
      networkTest = {
        status: 'success',
        httpStatus: testResponse.status,
        httpStatusText: testResponse.statusText,
        responseHeaders: Object.fromEntries(testResponse.headers.entries()),
        testData: {
          origin: testData.origin,
          userAgent: testData['user-agent']
        }
      };
    } catch (networkError) {
      networkTest = {
        status: 'error',
        error: networkError.message,
        stack: networkError.stack
      };
    }

    const debugReport = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      moduleTest,
      clientTest,
      apiTest,
      runtimeCheck,
      networkTest,
      requestInfo: {
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers.host,
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-vercel-forwarded-for': req.headers['x-vercel-forwarded-for'],
          'user-agent': req.headers['user-agent']
        }
      },
      summary: {
        envOk: envCheck.MISTRAL_API_KEY.exists,
        moduleOk: moduleTest.status === 'success',
        clientOk: clientTest.status === 'success',
        apiOk: apiTest.status === 'success',
        overallStatus: apiTest.status === 'success' ? 'WORKING' : 'FAILED'
      }
    };

    console.log('📊 DEBUG REPORT GENERATED:', debugReport.summary);

    return res.status(200).json(debugReport);

  } catch (error) {
    console.error('🚨 DEBUG ENDPOINT ERROR:', error);
    return res.status(500).json({
      error: 'Debug endpoint failed',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
