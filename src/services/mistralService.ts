// Cache for API responses to reduce costs and improve performance
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per minute

// Backend API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com/api/ai'
  : 'http://localhost:3000/api/ai';

export const CHAT_MODEL = "mistral-small"; // Free-tier compatible model
export const FAST_MODEL = "mistral-tiny"; // For simple tasks

// Retry logic configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// HTTP client for backend API
async function callBackendAPI(endpoint: string, data: any): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Calling backend API:', url, 'with data:', data);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API success response:', result);
    return result;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
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

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY_BASE
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (error instanceof Error && (
        error.message.includes('401') || // Unauthorized
        error.message.includes('403') || // Forbidden
        error.message.includes('400')    // Bad request
      )) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }
  
  throw lastError;
}

export async function chatWithAi(message: string, history: any[] = [], userId?: string): Promise<string> {
  if (!message.trim()) {
    throw new Error("Message cannot be empty");
  }

  if (!checkRateLimit(userId)) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const systemInstruction = "You are a helpful, intelligent AI assistant inside a productivity SaaS platform called Lumina Toolkit. You help users with writing, coding, learning, and general questions. Keep responses clear, practical, and human-like.";
  
  const cacheKey = getCacheKey(message, systemInstruction);
  const cachedResponse = getCachedResponse(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await retryWithBackoff(async () => {
      return await callBackendAPI('/chat', {
        message,
        history,
        userId
      });
    });

    const responseText = response.response || '';
    
    if (responseText) {
      setCachedResponse(cacheKey, responseText);
    }
    
    return responseText;
  } catch (error) {
    console.error('Mistral AI chat error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error("AI service authentication failed. Please contact support.");
      } else if (error.message.includes('429')) {
        throw new Error("AI service is temporarily overloaded. Please try again in a moment.");
      } else if (error.message.includes('timeout')) {
        throw new Error("AI service timed out. Please try again.");
      }
    }
    
    throw new Error("AI service is currently unavailable. Please try again later.");
  }
}

export async function generateAiContent(
  prompt: string, 
  systemInstruction: string = "You are a helpful AI assistant.",
  userId?: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    useCache?: boolean;
  } = {}
): Promise<string> {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  if (!checkRateLimit(userId)) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const {
    temperature = 0.7,
    maxTokens = 2000,
    model = CHAT_MODEL,
    useCache = true
  } = options;

  if (useCache) {
    const cacheKey = getCacheKey(prompt, systemInstruction);
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  try {
    const response = await retryWithBackoff(async () => {
      return await callBackendAPI('/generate', {
        prompt,
        systemInstruction,
        userId,
        options: {
          temperature,
          maxTokens,
          model,
          useCache
        }
      });
    });

    const responseText = response.response || '';
    
    if (responseText && useCache) {
      setCachedResponse(getCacheKey(prompt, systemInstruction), responseText);
    }
    
    return responseText;
  } catch (error) {
    console.error('Mistral AI generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error("AI service authentication failed. Please contact support.");
      } else if (error.message.includes('429')) {
        throw new Error("AI service is temporarily overloaded. Please try again in a moment.");
      } else if (error.message.includes('timeout')) {
        throw new Error("AI service timed out. Please try again.");
      }
    }
    
    throw new Error("AI service is currently unavailable. Please try again later.");
  }
}

// Utility function for structured JSON responses
export async function generateStructuredResponse<T>(
  prompt: string,
  systemInstruction: string,
  userId?: string,
  options?: Parameters<typeof generateAiContent>[2]
): Promise<T> {
  const response = await generateAiContent(
    prompt + "\n\nIMPORTANT: Respond with valid JSON only, no other text.",
    systemInstruction + " You always respond with valid JSON.",
    userId,
    options
  );

  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: try parsing the entire response
    return JSON.parse(response);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    throw new Error("AI service returned an invalid format. Please try again.");
  }
}

// Clear cache utility (for testing or manual refresh)
export function clearCache(): void {
  responseCache.clear();
}

// Get cache statistics (for monitoring)
export function getCacheStats(): { size: number; oldestEntry: number | null } {
  if (responseCache.size === 0) {
    return { size: 0, oldestEntry: null };
  }
  
  let oldestTimestamp = Date.now();
  for (const entry of responseCache.values()) {
    if (entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp;
    }
  }
  
  return {
    size: responseCache.size,
    oldestEntry: oldestTimestamp
  };
}
