'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.any()), // Simplified for now, Genkit handles Part[]
  })),
  message: z.string(),
  image: z.string().optional(), // Base64 string
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

export const chatWithMamaAi = async (input: ChatInput) => {
  const { history, message, image } = input;

  const systemPrompt = `You are MAMA AI, a friendly and knowledgeable skincare expert for Mamaearth. 
  Your goal is to help users with their skincare routines, product recommendations, and skin concerns.
  
  Guidelines:
  1. ONLY answer questions related to skincare, hair care, and Mamaearth products.
  2. If a user asks about anything else (e.g., math, politics, coding), politely decline and steer the conversation back to skincare.
  3. Be warm, empathetic, and helpful. Use emojis occasionally 🌿✨.
  4. If an image is provided, analyze it for skin concerns (e.g., acne, dryness) but DO NOT provide medical diagnoses. Suggest products or routines instead.
  5. Keep answers concise and easy to read.
  `;

  // Construct the current message content
  const currentMessageContent: any[] = [{ text: message }];
  if (image) {
    currentMessageContent.push({ media: { url: image } });
  }

  const response = await ai.generate({
    system: systemPrompt,
    history: history,
    prompt: currentMessageContent,
    config: {
      temperature: 0.7,
    }
  });

  return response.text;
};
