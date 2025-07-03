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
    .describe('A list of potential safety risks identified in the image. Be specific.'),
  confidenceScores: z
    .array(z.number())
    .describe('A list of confidence scores (0.0-1.0) for each identified hazard.'),
  overallSafetyAssessment: z
    .string()
    .describe('A brief, one or two-sentence overall safety assessment of the scene.'),
});
export type AiHazardHunterOutput = z.infer<typeof AiHazardHunterOutputSchema>;

export async function aiHazardHunter(input: AiHazardHunterInput): Promise<AiHazardHunterOutput> {
  return aiHazardHunterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHazardHunterPrompt',
  input: {schema: AiHazardHunterInputSchema},
  output: {schema: AiHazardHunterOutputSchema},
  prompt: `You are a world-class AI safety inspector named "Winston". Your task is to analyze the provided image of a worksite for potential safety hazards.

Analyze the image carefully and perform the following actions:
1.  **Identify Hazards**: Create a list of all potential safety risks or violations you can see. Be specific. For example, instead of "person not wearing PPE", say "A worker is not wearing a hard hat in a construction zone."
2.  **Confidence Score**: For each hazard you identify, provide a confidence score from 0.0 to 1.0, where 1.0 means you are absolutely certain and 0.0 means you are very uncertain.
3.  **Overall Assessment**: Based on the number and severity of the identified hazards, provide a brief, one or two-sentence overall safety assessment of the scene.

Return your findings ONLY in the specified JSON format.

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
