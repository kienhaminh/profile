import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
