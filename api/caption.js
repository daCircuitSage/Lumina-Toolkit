import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not configured. Caption generator will not work.');
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
    const { platform, tone, description, userId } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const systemPrompt = "You are a professional social media copywriter. Generate engaging captions based on user input. Keep tone natural, platform-appropriate, and creative. Separate each caption with [SEP].";

    const prompt = `Platform: ${platform || 'Instagram'}
Tone: ${tone || 'Engaging'}
Description: ${description}

Generate 3 engaging captions for this content. Make them platform-specific and engaging. Separate each caption with [SEP].`;

    const response = await mistral.chat.complete({
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
