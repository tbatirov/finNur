import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const { model, max_tokens, messages, system } = req.body;

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      messages,
      system
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
}