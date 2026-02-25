const OpenAI = require('openai');

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

const analyzeImageWithAI = async ({ imageUrl, systemPrompt, userPrompt, model }) => {
  const client = getOpenAIClient();
  const startTime = Date.now();

  // gpt-3.5-turbo görsel desteklemez, görsel için minimum gpt-4o-mini gerekir
  const imageModel = model || 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model: imageModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const processingTime = Date.now() - startTime;
  const tokensUsed = response.usage?.total_tokens || 0;
  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI API boş yanıt döndürdü.');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI yanıtı JSON formatında değil.');
  }

  return { data: parsed, tokensUsed, processingTime };
};

const generateTextWithAI = async ({ systemPrompt, userPrompt, model }) => {
  const client = getOpenAIClient();
  const startTime = Date.now();

  // Tarot ve yıldız falı için ucuz model kullan
  const textModel = model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  const response = await client.chat.completions.create({
    model: textModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const processingTime = Date.now() - startTime;
  const tokensUsed = response.usage?.total_tokens || 0;
  const content = response.choices[0]?.message?.content;

  if (!content) throw new Error('OpenAI API boş yanıt döndürdü.');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI yanıtı JSON formatında değil.');
  }

  return { data: parsed, tokensUsed, processingTime };
};

module.exports = { getOpenAIClient, analyzeImageWithAI, generateTextWithAI };
