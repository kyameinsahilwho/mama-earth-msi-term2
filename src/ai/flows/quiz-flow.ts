'use server';
/**
 * @fileOverview A flow to generate a quiz using an AI model.
 *
 * - generateQuiz - A function that generates a quiz on a given topic.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
  answerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct answer in the options array.'),
});

export const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).length(10).describe('An array of 10 multiple-choice questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
export type QuizQuestion = z.infer<typeof QuestionSchema>;

const quizPrompt = ai.definePrompt({
    name: 'quizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `Generate a 10-question multiple-choice quiz about {{topic}}. Each question must have exactly 4 options. Ensure the questions cover a range of difficulties from easy to medium.`,
});

const generateQuizFlow = ai.defineFlow(
    {
        name: 'generateQuizFlow',
        inputSchema: GenerateQuizInputSchema,
        outputSchema: GenerateQuizOutputSchema,
    },
    async (input) => {
        const { output } = await quizPrompt(input);
        return output!;
    }
);

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    return generateQuizFlow(input);
}
