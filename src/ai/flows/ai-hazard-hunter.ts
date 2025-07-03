'use server';

/**
 * @fileOverview An AI agent that identifies potential safety risks in an image.
 *
 * - aiHazardHunter - A function that handles the image analysis and risk identification process.
 * - AiHazardHunterInput - The input type for the aiHazardHunter function.
 * - AiHazardHunterOutput - The return type for the aiHazardHunter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiHazardHunterInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze for potential safety risks, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiHazardHunterInput = z.infer<typeof AiHazardHunterInputSchema>;

const AiHazardHunterOutputSchema = z.object({
  identifiedHazards: z
    .array(z.string())
    .describe('A list of potential safety risks identified in the image.'),
  confidenceScores: z
    .array(z.number())
    .describe('A list of confidence scores for each identified hazard.'),
  overallSafetyAssessment: z
    .string()
    .describe('An overall assessment of the safety of the scene in the image.'),
});
export type AiHazardHunterOutput = z.infer<typeof AiHazardHunterOutputSchema>;

export async function aiHazardHunter(input: AiHazardHunterInput): Promise<AiHazardHunterOutput> {
  return aiHazardHunterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHazardHunterPrompt',
  input: {schema: AiHazardHunterInputSchema},
  output: {schema: AiHazardHunterOutputSchema},
  prompt: `You are an expert safety inspector.  You will analyze the image provided and identify any potential safety hazards.  You will provide a list of the identified hazards, along with a confidence score (0-1) for each hazard. Finally, you will provide an overall assessment of the safety of the scene in the image.

Image: {{media url=photoDataUri}}`,
});

const aiHazardHunterFlow = ai.defineFlow(
  {
    name: 'aiHazardHunterFlow',
    inputSchema: AiHazardHunterInputSchema,
    outputSchema: AiHazardHunterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
