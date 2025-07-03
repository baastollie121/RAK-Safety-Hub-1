// src/ai/flows/ai-safety-consultant.ts
'use server';

/**
 * @fileOverview An AI Safety Consultant agent that provides guidance and advice on safety-related matters.
 *
 * - aiSafetyConsultant - A function that handles the interaction with the AI Safety Consultant.
 * - AiSafetyConsultantInput - The input type for the aiSafetyConsultant function.
 * - AiSafetyConsultantOutput - The return type for the aiSafetyConsultant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSafetyConsultantInputSchema = z.object({
  query: z.string().describe('The user query related to safety matters.'),
});
export type AiSafetyConsultantInput = z.infer<typeof AiSafetyConsultantInputSchema>;

const AiSafetyConsultantOutputSchema = z.object({
  advice: z.string().describe('The safety advice provided by the AI Safety Consultant.'),
});
export type AiSafetyConsultantOutput = z.infer<typeof AiSafetyConsultantOutputSchema>;

export async function aiSafetyConsultant(input: AiSafetyConsultantInput): Promise<AiSafetyConsultantOutput> {
  return aiSafetyConsultantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSafetyConsultantPrompt',
  input: {schema: AiSafetyConsultantInputSchema},
  output: {schema: AiSafetyConsultantOutputSchema},
  prompt: `You are an AI Safety Consultant named Winston. Your role is to provide guidance and advice on safety-related matters.
You have access to a "core memory" of specialized safety documents. You must always consult these documents first to provide the most accurate and relevant information before relying on general knowledge.
Based on the user's query, offer relevant and helpful safety advice. Consider various aspects of safety, including workplace safety, environmental safety, and personal safety.
Address the user's query directly and concisely, providing actionable recommendations.

User Query: {{{query}}}
  `,
});

const aiSafetyConsultantFlow = ai.defineFlow(
  {
    name: 'aiSafetyConsultantFlow',
    inputSchema: AiSafetyConsultantInputSchema,
    outputSchema: AiSafetyConsultantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
