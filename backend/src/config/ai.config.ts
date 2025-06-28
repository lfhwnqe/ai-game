import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
  },
  langchain: {
    tracingV2: process.env.LANGCHAIN_TRACING_V2 === 'true',
    apiKey: process.env.LANGCHAIN_API_KEY,
  },
  mastra: {
    apiKey: process.env.MASTRA_API_KEY,
  },
  decisionTimeout: parseInt(process.env.AI_DECISION_TIMEOUT) || 30000,
  enableCache: process.env.AI_ENABLE_CACHE !== 'false',
}));
