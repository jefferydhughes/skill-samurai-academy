import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, response_json_schema } = req.body as {
    prompt: string;
    response_json_schema?: object;
  };

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant for Skill Samurai Academy, an education platform specialising in coding, STEM, and robotics for youth. Respond with valid JSON only when a schema is provided.',
    },
    { role: 'user', content: prompt },
  ];

  const body: Record<string, unknown> = {
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
  };

  if (response_json_schema) {
    body.response_format = { type: 'json_object' };
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', errText);
      return res.status(502).json({ error: 'OpenAI request failed', detail: errText });
    }

    const data = await openaiRes.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content ?? '';

    if (response_json_schema) {
      try {
        const parsed = JSON.parse(content);
        return res.status(200).json(parsed);
      } catch {
        return res.status(200).json({ raw: content });
      }
    }

    return res.status(200).json({ content });
  } catch (err) {
    console.error('invokeLLM error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
