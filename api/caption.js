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
  console.log('🔍 Caption API - Environment check:', {
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
    console.log('✅ Caption Mistral client initialized successfully');
  }
  
  return mistral;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, tone, description, userId } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Initialize Mistral client
    let mistralClient;
    try {
      mistralClient = await initializeMistral();
    } catch (initError) {
      console.error('❌ Failed to initialize Mistral for Caption:', initError);
      return res.status(500).json({ 
        error: 'AI service initialization failed',
        details: initError.message
      });
    }

    const systemPrompt = "You are a professional social media copywriter. Generate engaging captions based on user input. Keep tone natural, platform-appropriate, and creative. Separate each caption with [SEP].";

    const prompt = `Platform: ${platform || 'Instagram'}
Tone: ${tone || 'Engaging'}
Description: ${description}

Generate 3 engaging captions for this content. Make them platform-specific and engaging. Separate each caption with [SEP].`;

    console.log('🤖 Calling Mistral API for captions...');
    
    const response = await mistralClient.chat.complete({
      model: "mistral-small",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      maxTokens: 1000
    });

    const responseText = response.choices?.[0]?.message?.content || '';
    
    // Split captions and clean them up
    const captions = responseText.split('[SEP]')
      .map((caption) => caption.trim())
      .filter((caption) => caption.length > 0);
    
    return res.json({ 
      captions: captions.length > 0 ? captions : [responseText.trim()],
      count: captions.length
    });

  } catch (error) {
    console.error('Caption generator error:', error);
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    return res.status(statusCode).json({ 
      error: error.message || 'Caption generation service unavailable' 
    });
  }
}
