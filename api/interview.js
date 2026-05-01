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
  console.log('🔍 Interview API - Environment check:', {
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
    console.log('✅ Interview Mistral client initialized successfully');
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
    const { role, userId } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Initialize Mistral client
    let mistralClient;
    try {
      mistralClient = await initializeMistral();
    } catch (initError) {
      console.error('❌ Failed to initialize Mistral for Interview:', initError);
      return res.status(500).json({ 
        error: 'AI service initialization failed',
        details: initError.message
      });
    }

    const systemPrompt = "You are an expert interview coach. Generate diverse interview questions with model answers. Return strictly as a JSON list of objects with 'question', 'answer', and 'type' fields.";

    const prompt = `Generate 9 diverse interview questions for the role: "${role}".
Provide 3 of each category: 'technical', 'behavioral', and 'general'.
For each question, provide a concise, high-impact "model answer" or coaching tip.

Output strictly as a JSON list of objects:
[
  { "question": "...", "answer": "...", "type": "technical" },
  { "question": "...", "answer": "...", "type": "behavioral" },
  { "question": "...", "answer": "...", "type": "general" },
  ...
]

Make questions realistic and answers practical and actionable.`;

    console.log('🤖 Calling Mistral API for interview questions...');
    
    const response = await mistralClient.chat.complete({
      model: "mistral-small",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      maxTokens: 2000
    });

    const responseText = response.choices?.[0]?.message?.content || '';
    
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return res.json({ questions });
      }
      
      // Fallback parsing
      const questions = JSON.parse(responseText);
      return res.json({ questions });
    } catch (parseError) {
      console.error('Failed to parse interview questions:', parseError);
      // Return basic questions if JSON parsing fails
      return res.json({
        questions: [
          { question: "Tell me about your experience with this role.", answer: "Focus on relevant experience and achievements.", type: "general" },
          { question: "What are your technical strengths?", answer: "Highlight your key technical skills.", type: "technical" },
          { question: "How do you handle challenges?", answer: "Provide a specific example of problem-solving.", type: "behavioral" }
        ]
      });
    }

  } catch (error) {
    console.error('Interview prep error:', error);
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    return res.status(statusCode).json({ 
      error: error.message || 'Interview preparation service unavailable' 
    });
  }
}
