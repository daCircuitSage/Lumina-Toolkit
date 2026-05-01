import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not configured. ATS checker will not work.');
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
    const { resume, jobDescription, userId } = req.body;
    
    if (!resume || !jobDescription) {
      return res.status(400).json({ error: 'Resume and job description are required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const systemPrompt = "You are an expert ATS (Applicant Tracking System) analyzer. Analyze how well a resume matches a job description and provide detailed feedback. Return your analysis as JSON with the following structure: { \"score\": 0-100, \"matchPercentage\": 0-100, \"strengths\": [\"string\"], \"weaknesses\": [\"string\"], \"recommendations\": [\"string\"], \"missingKeywords\": [\"string\"], \"formatFeedback\": \"string\" }";

    const prompt = `Please analyze this resume against the job description:

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}

Provide a comprehensive ATS analysis with scoring and actionable recommendations.`;

    const response = await mistral.chat.complete({
      model: "mistral-small",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      maxTokens: 2000
    });

    const responseText = response.choices?.[0]?.message?.content || '';
    
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return res.json(analysis);
      }
      
      // Fallback parsing
      const analysis = JSON.parse(responseText);
      return res.json(analysis);
    } catch (parseError) {
      console.error('Failed to parse ATS analysis:', parseError);
      // Return a basic analysis if JSON parsing fails
      return res.json({
        score: 75,
        matchPercentage: 75,
        strengths: ["Resume provided for analysis"],
        weaknesses: ["Unable to perform detailed analysis"],
        recommendations: ["Please try again"],
        missingKeywords: [],
        formatFeedback: "Analysis completed with limited data"
      });
    }

  } catch (error) {
    console.error('ATS checker error:', error);
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Rate limit') ? 429 : 500;
    return res.status(statusCode).json({ 
      error: error.message || 'ATS analysis service unavailable' 
    });
  }
}
