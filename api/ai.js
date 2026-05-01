// Dynamic import for Vercel compatibility
let Mistral;
let mistral;

// Initialize Mistral client
async function initializeMistral() {
  if (!Mistral) {
    const module = await import('@mistralai/mistralai');
    Mistral = module.Mistral;
  }
  
  const apiKey = process.env.MISTRAL_API_KEY;
  
  // Debug logging
  console.log('🔍 AI API - Environment check:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });

  if (!apiKey) {
    console.error('❌ MISTRAL_API_KEY is not configured in environment variables');
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  if (!mistral) {
    mistral = new Mistral({ apiKey });
    console.log('✅ Mistral client initialized successfully');
  }
  
  return mistral;
}

// Cache for API responses
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting protection
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per minute

function checkRateLimit(identifier = 'default') {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function getCacheKey(prompt, systemInstruction) {
  return `${prompt}:${systemInstruction}`;
}

function getCachedResponse(cacheKey) {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  if (cached) {
    responseCache.delete(cacheKey);
  }
  return null;
}

function setCachedResponse(cacheKey, response) {
  responseCache.set(cacheKey, { response, timestamp: Date.now() });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (error instanceof Error && (
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('400')
      )) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }
  
  throw lastError;
}

// Main handler function for Vercel
export default async function handler(req, res) {
  console.log('🚀 AI API Request:', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent']
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract endpoint from URL - handle both /api/ai/endpoint and /endpoint
  const { url, method } = req;
  let endpoint = url;
  
  // Remove /api/ai prefix if present
  if (endpoint.startsWith('/api/ai/')) {
    endpoint = endpoint.replace('/api/ai', '');
  } else if (endpoint.startsWith('/api/ai')) {
    endpoint = endpoint.replace('/api/ai', '') || '/';
  }
  
  try {
    // Health check endpoint
    if (endpoint === '/health' && method === 'GET') {
      const hasApiKey = !!process.env.MISTRAL_API_KEY;
      return res.json({ 
        status: 'ok', 
        service: hasApiKey ? 'configured' : 'not_configured',
        provider: 'mistral',
        environment: process.env.NODE_ENV || 'unknown'
      });
    }

    // Chat endpoint
    if (endpoint === '/chat' && method === 'POST') {
      console.log('💬 Chat endpoint called');
      
      const { message, history, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!checkRateLimit(userId)) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }

      // Initialize Mistral client
      let mistralClient;
      try {
        mistralClient = await initializeMistral();
      } catch (initError) {
        console.error('❌ Failed to initialize Mistral:', initError);
        return res.status(500).json({ 
          error: 'AI service initialization failed',
          details: initError.message
        });
      }

      const systemInstruction = "You are a helpful, intelligent AI assistant inside a productivity SaaS platform called Lumina Toolkit. You help users with writing, coding, learning, and general questions. Keep responses clear, practical, and human-like.";
      
      const cacheKey = getCacheKey(message, systemInstruction);
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log('📋 Using cached response');
        return res.json({ response: cachedResponse });
      }

      console.log('🤖 Calling Mistral API...');
      
      const response = await retryWithBackoff(async () => {
        return await mistralClient.chat.complete({
          model: "mistral-small",
          messages: [
            { role: 'system', content: systemInstruction },
            ...(history || []).map((msg) => {
              const role = msg.role === 'user' ? 'user' : 'assistant';
              return {
                role: role,
                content: msg.content
              };
            }).filter(msg => msg && msg.content),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          maxTokens: 2000
        });
      });

      const responseText = (response.choices?.[0]?.message?.content) || '';
      
      console.log('✅ Mistral response received:', {
        responseLength: responseText.length,
        model: response.model,
        usage: response.usage
      });
      
      if (responseText) {
        setCachedResponse(cacheKey, responseText);
      }
      
      return res.json({ response: responseText });
    }

    // Generate content endpoint
    if (endpoint === '/generate' && method === 'POST') {
      console.log('📝 Generate endpoint called');
      
      const { prompt, systemInstruction, userId, options } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!checkRateLimit(userId)) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }

      // Initialize Mistral client
      let mistralClient;
      try {
        mistralClient = await initializeMistral();
      } catch (initError) {
        console.error('❌ Failed to initialize Mistral:', initError);
        return res.status(500).json({ 
          error: 'AI service initialization failed',
          details: initError.message
        });
      }

      const {
        temperature = 0.7,
        maxTokens = 2000,
        model = "mistral-small",
        useCache = true
      } = options || {};

      const finalSystemInstruction = systemInstruction || "You are a helpful AI assistant.";
      
      if (useCache) {
        const cacheKey = getCacheKey(prompt, finalSystemInstruction);
        const cachedResponse = getCachedResponse(cacheKey);
        if (cachedResponse) {
          console.log('📋 Using cached response');
          return res.json({ response: cachedResponse });
        }
      }

      console.log('🤖 Calling Mistral API for generation...');
      
      const response = await retryWithBackoff(async () => {
        return await mistralClient.chat.complete({
          model,
          messages: [
            { role: 'system', content: finalSystemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature,
          maxTokens
        });
      });

      const responseText = (response.choices?.[0]?.message?.content) || '';
      
      console.log('✅ Mistral generation response received:', {
        responseLength: responseText.length,
        model: response.model,
        usage: response.usage
      });
      
      if (responseText && useCache) {
        setCachedResponse(getCacheKey(prompt, finalSystemInstruction), responseText);
      }
      
      return res.json({ response: responseText });
    }

    // Structured response endpoint
    if (endpoint === '/generate-structured' && method === 'POST') {
      const { prompt, systemInstruction, userId, options } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!checkRateLimit(userId)) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }

      if (!apiKey) {
        return res.status(500).json({ error: 'AI service not configured' });
      }

      const {
        temperature = 0.7,
        maxTokens = 2000,
        model = "mistral-small"
      } = options || {};

      const finalSystemInstruction = (systemInstruction || "You are a helpful AI assistant.") + " You always respond with valid JSON.";
      const finalPrompt = prompt + "\n\nIMPORTANT: Respond with valid JSON only, no other text.";
      
      const response = await retryWithBackoff(async () => {
        return await mistral.chat.complete({
          model,
          messages: [
            { role: 'system', content: finalSystemInstruction },
            { role: 'user', content: finalPrompt }
          ],
          temperature,
          maxTokens
        });
      });

      const responseText = (response.choices?.[0]?.message?.content) || '';
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          return res.json({ response: parsedResponse });
        }
        
        // Fallback: try parsing the entire response
        const parsedResponse = JSON.parse(responseText);
        return res.json({ response: parsedResponse });
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        return res.status(500).json({ 
          error: "AI service returned an invalid format. Please try again." 
        });
      }
    }

    // 404 for unknown endpoints
    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('🚨 AI API Error:', {
      error: error.message,
      stack: error.stack,
      endpoint: endpoint,
      method: method
    });

    // Determine appropriate status code and error message
    let statusCode = 500;
    let errorMessage = 'AI service unavailable';

    if (error.message.includes('authentication') || error.message.includes('401')) {
      statusCode = 401;
      errorMessage = 'AI service authentication failed. Please check your API key configuration.';
    } else if (error.message.includes('Rate limit') || error.message.includes('429')) {
      statusCode = 429;
      errorMessage = 'AI service rate limit exceeded. Please try again later.';
    } else if (error.message.includes('quota') || error.message.includes('403')) {
      statusCode = 403;
      errorMessage = 'AI service quota exceeded. Please check your plan.';
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      statusCode = 408;
      errorMessage = 'AI service request timed out. Please try again.';
    } else if (error.message.includes('MISTRAL_API_KEY is not configured')) {
      statusCode = 500;
      errorMessage = 'AI service not properly configured. Please contact support.';
    }

    return res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      endpoint: endpoint,
      timestamp: new Date().toISOString()
    });
  }
}
