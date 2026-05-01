const { Mistral } = require('@mistralai/mistralai');
require('dotenv').config();

const apiKey = process.env.MISTRAL_API_KEY;

console.log('Testing Mistral API...');
console.log('API Key length:', apiKey ? apiKey.length : 'undefined');

if (!apiKey) {
  console.error('No API key found');
  process.exit(1);
}

const mistral = new Mistral({ apiKey });

async function testMistral() {
  try {
    console.log('Making test API call...');
    const response = await mistral.chat.complete({
      model: 'mistral-small',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
      temperature: 0.7,
      maxTokens: 100
    });

    console.log('Success! Response:', response.choices?.[0]?.message?.content);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testMistral();
