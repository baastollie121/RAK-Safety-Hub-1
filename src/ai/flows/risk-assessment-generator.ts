'use server';

/**
 * @fileOverview An AI agent for generating South African OHS Act-compliant risk assessments.
 *
 * - generateRiskAssessment - A function that handles the risk assessment generation process.
 * - GenerateRiskAssessmentInput - The input type for the generateRiskAssessment function.
 * - GenerateRiskAssessmentOutput - The return type for the generateRiskAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRiskAssessmentInputSchema = z.object({
  taskDescription: z.string().describe('A description of the task for which the risk assessment is being generated.'),
  location: z.string().describe('The location where the task will be performed.'),
  potentialHazards: z.string().describe('A list of potential hazards associated with the task.'),
  existingControls: z.string().describe('A description of existing control measures in place.'),
  additionalControlsRequired: z.string().describe('A description of additional control measures required.'),
  riskRatingBeforeControls: z.string().describe('Risk rating before controls are implemented'),
  riskRatingAfterControls: z.string().describe('Risk rating after controls are implemented'),
});
export type GenerateRiskAssessmentInput = z.infer<typeof GenerateRiskAssessmentInputSchema>;

const GenerateRiskAssessmentOutputSchema = z.object({
  riskAssessmentDocument: z.string().describe('A South African OHS Act-compliant risk assessment document.'),
});
export type GenerateRiskAssessmentOutput = z.infer<typeof GenerateRiskAssessmentOutputSchema>;

export async function generateRiskAssessment(input: GenerateRiskAssessmentInput): Promise<GenerateRiskAssessmentOutput> {
  return generateRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRiskAssessmentPrompt',
  input: {schema: GenerateRiskAssessmentInputSchema},
  output: {schema: GenerateRiskAssessmentOutputSchema},
  prompt: `You are an expert safety officer specializing in South African OHS Act compliance.

You will use the following information to generate a risk assessment document.

Task Description: {{{taskDescription}}}
Location: {{{location}}}
Potential Hazards: {{{potentialHazards}}}
Existing Controls: {{{existingControls}}}
Additional Controls Required: {{{additionalControlsRequired}}}
Risk Rating Before Controls: {{{riskRatingBeforeControls}}}
Risk Rating After Controls: {{{riskRatingAfterControls}}}

Generate a comprehensive risk assessment document that complies with the South African OHS Act, 
considering the provided information. Ensure that the document includes all necessary sections and addresses 
the identified hazards and controls effectively.
`,
});

const generateRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'generateRiskAssessmentFlow',
    inputSchema: GenerateRiskAssessmentInputSchema,
    outputSchema: GenerateRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
