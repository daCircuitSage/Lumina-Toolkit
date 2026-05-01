import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not configured. YouTube title generator will not work.');
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
    const { topic, audience, tone, userId } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const systemPrompt = "You are a YouTube SEO expert. Generate 10 optimized YouTube titles that are engaging, keyword-rich, and optimized for virality and high CTR. Return as a plain list with each title on a new line. Do not number them.";

    const prompt = `Topic: ${topic}
Audience: ${audience || 'General'}
Tone: ${tone || 'High CTR'}

Generate 10 compelling YouTube titles for this video content. Make them SEO-friendly and clickable.`;

    const response = await mistral.chat.complete({
      model: "mistral-small",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      maxTokens: 800
    });

    const responseText = response.choices?.[0]?.message?.content || '';
    
    // Split titles and clean them up
    const titles = responseText.split('\n')
      .map((title) => title.trim())
      .filter((title) => title.length > 5);
    
    return res.json({ 
      titles: titles.length > 0 ? titles : [responseText.trim()],
      count: titles.length
    });

  } catch (error) {
    console.error('YouTube title generator error:', error);
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    return res.status(statusCode).json({ 
      error: error.message || 'YouTube title generation service unavailable' 
    });
  }
}
