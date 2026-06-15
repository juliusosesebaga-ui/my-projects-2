const axios = require('axios');
require('dotenv').config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are a friendly, professional plumbing business assistant. Your goal is to:
1. Greet customers and ask about their plumbing issue.
2. Understand the problem (type, location, urgency).
3. Request a photo if needed for diagnosis.
4. Provide a price estimate based on the issue description (typical range: $30-$150 for diagnostics, $50-$500+ for repairs).
5. Offer a fixed negotiation: "I can offer a 10% discount if you book within 24 hours."
6. Suggest scheduling a visit.

Always be helpful, honest, and professional. If a customer asks about price, give a range and ask for photos/details to narrow it down.
Keep responses short (under 150 words), clear, and friendly.
If asked to transfer to owner, acknowledge and prepare a transfer message.`;

async function getAIResponse(userText = '', meta = {}) {
  if (!OPENAI_KEY) return 'Hi — I am configured but missing the OpenAI API key. Please set OPENAI_API_KEY.';

  const { session = {}, hasMedia = false, mediaType = null } = meta;

  // Build context from session
  let context = '';
  if (session.collectedFields) {
    const fields = session.collectedFields;
    if (fields.problemType) context += `Known issue: ${fields.problemType}. `;
    if (fields.location) context += `Location: ${fields.location}. `;
    if (fields.urgency) context += `Urgency: ${fields.urgency}. `;
  }
  if (hasMedia && mediaType === 'image') {
    context += 'Customer provided a photo. Ask for details about the photo if not yet discussed. ';
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: context ? `[Context: ${context}]\n\n${userText}` : userText }
  ];

  try {
    const resp = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 200,
        temperature: 0.6
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = resp.data.choices?.[0]?.message?.content || '';
    return content.trim();
  } catch (err) {
    console.error('OpenAI error', err?.response?.data || err.message);
    return 'Sorry, I had trouble answering that. Let me connect you with the owner or try rephrasing your question.';
  }
}

module.exports = { getAIResponse };
