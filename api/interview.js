import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not configured. Interview prep will not work.');
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
    const { role, userId } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
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

    const response = await mistral.chat.complete({
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
