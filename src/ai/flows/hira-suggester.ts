'use server';
/**
 * @fileOverview An AI agent that suggests potential hazards for a given task.
 *
 * - suggestHiraHazards - A function that suggests hazards for a HIRA.
 * - SuggestHiraHazardsInput - The input type for the suggestHiraHazards function.
 * - SuggestHiraHazardsOutput - The return type for the suggestHiraHazards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestedHazardSchema = z.object({
    hazard: z.string().describe('A specific, potential hazard related to the task.'),
    personsAffected: z.string().describe('Who could be affected by this hazard and the likely harm.'),
    controlMeasures: z.string().describe('A set of recommended control measures to mitigate this hazard.'),
});

const SuggestHiraHazardsInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task or project being assessed.'),
});
export type SuggestHiraHazardsInput = z.infer<typeof SuggestHiraHazardsInputSchema>;

const SuggestHiraHazardsOutputSchema = z.object({
  suggestedHazards: z.array(SuggestedHazardSchema).describe('A list of up to 5 suggested hazards with details.'),
});
export type SuggestHiraHazardsOutput = z.infer<typeof SuggestHiraHazardsOutputSchema>;

export async function suggestHiraHazards(input: SuggestHiraHazardsInput): Promise<SuggestHiraHazardsOutput> {
  return suggestHiraHazardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHiraHazardsPrompt',
  input: {schema: SuggestHiraHazardsInputSchema},
  output: {schema: SuggestHiraHazardsOutputSchema},
  prompt: `You are an expert safety officer specializing in South African OHS Act compliance. Your task is to brainstorm potential hazards for a given worksite task.

Based on the task title provided, identify up to 5 common but critical hazards. For each hazard, describe who might be affected and the likely harm, and suggest a set of specific control measures.

Return your findings ONLY in the specified JSON format.

Task Title: {{{taskTitle}}}`,
});

const suggestHiraHazardsFlow = ai.defineFlow(
  {
    name: 'suggestHiraHazardsFlow',
    inputSchema: SuggestHiraHazardsInputSchema,
    outputSchema: SuggestHiraHazardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
