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
  console.log('🔍 Cover Letter API - Environment check:', {
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
    console.log('✅ Cover Letter Mistral client initialized successfully');
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
    const { role, company, experience, tone, userId } = req.body;
    
    if (!role || !company) {
      return res.status(400).json({ error: 'Role and company are required' });
    }

    // Initialize Mistral client
    let mistralClient;
    try {
      mistralClient = await initializeMistral();
    } catch (initError) {
      console.error('❌ Failed to initialize Mistral for Cover Letter:', initError);
      return res.status(500).json({ 
        error: 'AI service initialization failed',
        details: initError.message
      });
    }

    const systemPrompt = "You are a professional cover letter writer. Create compelling, tailored cover letters that highlight the candidate's strengths and match the company's needs. Write in a professional, engaging tone.";

    const prompt = `Create a highly professional and tailored cover letter for the following position:
Role: ${role}
Company: ${company}
Relevant Experience: ${experience || 'Not specified'}
Tone: ${tone || 'professional'}

Requirements:
- Start with a strong opening that grabs attention
- Highlight 2-3 key relevant skills/experiences
- Show enthusiasm for the role and company
- Include a professional closing
- Keep it to 3-4 paragraphs maximum
- Make it sound authentic and personalized

Return the complete cover letter without any additional formatting or explanations.`;

    console.log('🤖 Calling Mistral API for cover letter...');
    
    const response = await mistralClient.chat.complete({
      model: "mistral-small",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1500
    });

    const coverLetter = response.choices?.[0]?.message?.content || '';
    
    return res.json({ 
      coverLetter: coverLetter.trim(),
      wordCount: coverLetter.split(' ').length
    });

  } catch (error) {
    console.error('Cover letter generator error:', error);
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    return res.status(statusCode).json({ 
      error: error.message || 'Cover letter generation service unavailable' 
    });
  }
}
