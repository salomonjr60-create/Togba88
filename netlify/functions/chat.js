const SYSTEM_PROMPT = `You are the AI assistant for Togba Local Hub, a digital marketing agency in Dubai serving local businesses.
Help visitors with local SEO, Google Business Profile, social media, local advertising, reviews, and website marketing.
Be concise, friendly and honest. Do not invent prices, offers, or details about the business.
For pricing or a consultation, direct visitors to /contact or WhatsApp at +971 56 241 1885.`;

exports.handler = async (event) => {
  const json = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  });

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  if (typeof event.body !== 'string' || event.body.length > 20000) {
    return json(400, { error: 'Invalid request.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '');
  } catch {
    return json(400, { error: 'Invalid request.' });
  }

  if (!Array.isArray(body?.messages) || body.messages.length < 1 || body.messages.length > 10 ||
      body.messages.some((message) => !message ||
        !['user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string' || !message.content.trim() || message.content.length > 500)) {
    return json(400, { error: 'Please send up to 10 messages of 500 characters or fewer.' });
  }

  const { AZURE_OPENAI_MODEL } = process.env;
  const apiKey = process.env.AZURE_API_KEY || process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
  const missing = [
    !endpoint && 'AZURE_ENDPOINT or AZURE_OPENAI_ENDPOINT',
    !apiKey && 'AZURE_API_KEY or AZURE_OPENAI_API_KEY',
    !AZURE_OPENAI_MODEL && 'AZURE_OPENAI_MODEL',
  ].filter(Boolean);
  if (missing.length) {
    console.error('Missing Azure OpenAI environment variables:', missing.join(', '));
    return json(503, { error: 'Chat is temporarily unavailable. Please contact us via WhatsApp or our contact page.' });
  }

  try {
    const response = await fetch(`${endpoint.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        model: AZURE_OPENAI_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...body.messages],
      }),
    });
    if (!response.ok) {
      console.error('Azure OpenAI request failed:', response.status);
      return json(502, { error: 'Chat is temporarily unavailable. Please try again later.' });
    }
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      console.error('Azure OpenAI returned an empty response.');
      return json(502, { error: 'Chat is temporarily unavailable. Please try again later.' });
    }
    return json(200, { content });
  } catch (error) {
    console.error('Azure OpenAI request failed:', error);
    return json(502, { error: 'Chat is temporarily unavailable. Please try again later.' });
  }
};
