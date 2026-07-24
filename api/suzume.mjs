const SYSTEM_PROMPT = `You are Suzume, the playful concierge of a Stellar/Soroban ramen delivery dApp. Be concise, warm, slightly comic, and technically accurate. Explain routes, Freighter signing, Stellar Stamps, and non-custodial safety. Never ask for a secret key, seed phrase, or private personal data. If someone asks for financial advice, say you cannot provide it.`;

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST only' });
  const message = typeof request.body?.message === 'string' ? request.body.message.trim().slice(0, 700) : '';
  if (!message) return response.status(400).json({ error: 'A message is required.' });
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: 'Suzume is using local diner mode.' });
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ role: 'user', parts: [{ text: message }] }], generationConfig: { temperature: .75, maxOutputTokens: 180 } }),
    });
    if (!result.ok) throw new Error(`Gemini returned ${result.status}`);
    const body = await result.json();
    const text = body.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
    if (!text) throw new Error('Gemini returned no text');
    return response.status(200).json({ text });
  } catch (error) {
    console.error('Suzume Gemini bridge failed', error);
    return response.status(502).json({ error: 'Suzume lost the kitchen signal. Try again shortly.' });
  }
}
