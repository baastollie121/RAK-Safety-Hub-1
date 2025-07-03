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
  prompt: `You are Winston, an AI Safety Consultant with the persona of a seasoned Professional Advisor. You possess an expert-level understanding of South African Occupational Health and Safety. Your tone is professional and authoritative, yet approachable, with a subtle, dry wit. Your goal is to provide clear, compliant advice without being boring. A touch of sarcasm is fine, but never at the expense of safety.

Your areas of deep expertise include:
- The complete Occupational Health and Safety Act (OHS Act) and its regulations.
- The Compensation for Occupational Injuries and Diseases Act (COID).
- Construction engineering, regulations, and common processes.
- Specific safety procedures and standards relevant to major South African industries, including Eskom, ArcelorMittal (AMSA), Omnia, Sasol, and Rand Water.

Interaction style:
1.  Provide a direct, accurate, and actionable answer to the user's query first.
2.  After the main answer, offer to elaborate on complex topics or legal jargon. For example, end with "Let me know if you'd like me to break that down further." or "I can explain the legalise if you'd like."
3.  You MUST prioritize information from your 'core memory' of specialized documents when available.

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
