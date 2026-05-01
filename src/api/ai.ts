import express from 'express';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not configured. AI features will not work.');
} else {
  console.log('MISTRAL_API_KEY is configured, length:', apiKey.length);
}

const mistral = new Mistral({ apiKey: apiKey || "" });

// Cache for API responses
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per minute

function checkRateLimit(identifier: string = 'default'): boolean {
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

function getCacheKey(prompt: string, systemInstruction: string): string {
  return `${prompt}:${systemInstruction}`;
}

function getCachedResponse(cacheKey: string): string | null {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  if (cached) {
    responseCache.delete(cacheKey);
  }
  return null;
}

function setCachedResponse(cacheKey: string, response: string): void {
  responseCache.set(cacheKey, { response, timestamp: Date.now() });
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
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

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const systemInstruction = "You are a helpful, intelligent AI assistant inside a productivity SaaS platform called Lumina Toolkit. You help users with writing, coding, learning, and general questions. Keep responses clear, practical, and human-like.";
    
    const cacheKey = getCacheKey(message, systemInstruction);
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.json({ response: cachedResponse });
    }

    const response = await retryWithBackoff(async () => {
      return await mistral.chat.complete({
        model: "mistral-small",
        messages: [
          { role: 'system', content: systemInstruction },
          ...(history || []).map((msg: any) => {
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

    const responseText = (response.choices?.[0]?.message?.content as string) || '';
    
    if (responseText) {
      setCachedResponse(cacheKey, responseText);
    }
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    res.status(statusCode).json({ 
      error: error.message || 'Chat service unavailable' 
    });
  }
});

// Generate content endpoint
router.post('/generate', async (req, res) => {
  try {
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
      model = "mistral-small",
      useCache = true
    } = options || {};

    const finalSystemInstruction = systemInstruction || "You are a helpful AI assistant.";
    
    if (useCache) {
      const cacheKey = getCacheKey(prompt, finalSystemInstruction);
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        return res.json({ response: cachedResponse });
      }
    }

    const response = await retryWithBackoff(async () => {
      return await mistral.chat.complete({
        model,
        messages: [
          { role: 'system', content: finalSystemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature,
        maxTokens
      });
    });

    const responseText = (response.choices?.[0]?.message?.content as string) || '';
    
    if (responseText && useCache) {
      setCachedResponse(getCacheKey(prompt, finalSystemInstruction), responseText);
    }
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('Generate API error:', error);
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    res.status(statusCode).json({ 
      error: error.message || 'Generation service unavailable' 
    });
  }
});

// Structured response endpoint (for JSON responses)
router.post('/generate-structured', async (req, res) => {
  try {
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

    const responseText = (response.choices?.[0]?.message?.content as string) || '';
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = (responseText as string).match(/\{[\s\S]*\}|\[[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return res.json({ response: parsedResponse });
      }
      
      // Fallback: try parsing the entire response
      const parsedResponse = JSON.parse(responseText as string);
      res.json({ response: parsedResponse });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      res.status(500).json({ 
        error: "AI service returned an invalid format. Please try again." 
      });
    }
  } catch (error) {
    console.error('Structured generate API error:', error);
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    res.status(statusCode).json({ 
      error: error.message || 'Generation service unavailable' 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  res.json({ 
    status: 'ok', 
    service: apiKey ? 'configured' : 'not_configured',
    provider: 'mistral'
  });
});

export default router;
