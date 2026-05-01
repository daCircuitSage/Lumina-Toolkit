import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not configured. Cover letter generator will not work.');
}

const mistral = new Mistral({ apiKey: apiKey || "" });

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

    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
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

    const response = await mistral.chat.complete({
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
