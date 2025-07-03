// SafeWorkProcedureGenerator story implementation.
'use server';
/**
 * @fileOverview A safe work procedure generator AI agent.
 *
 * - generateSafeWorkProcedure - A function that handles the safe work procedure generation process.
 * - GenerateSafeWorkProcedureInput - The input type for the generateSafeWorkProcedure function.
 * - GenerateSafeWorkProcedureOutput - The return type for the generateSafeWorkProcedure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSafeWorkProcedureInputSchema = z.object({
  taskDescription: z.string().describe('A description of the task for which the safe work procedure is being created.'),
  potentialHazards: z.string().describe('A list of potential hazards associated with the task.'),
  controlMeasures: z.string().describe('A list of control measures to mitigate the identified hazards.'),
  requiredEquipment: z.string().describe('A list of equipment required to perform the task safely.'),
  stepByStepProcedure: z.string().describe('A detailed, step-by-step procedure for performing the task safely.'),
  emergencyProcedures: z.string().describe('Emergency procedures to follow in case of an incident.'),
});
export type GenerateSafeWorkProcedureInput = z.infer<typeof GenerateSafeWorkProcedureInputSchema>;

const GenerateSafeWorkProcedureOutputSchema = z.object({
  safeWorkProcedure: z.string().describe('The generated safe work procedure document.'),
});
export type GenerateSafeWorkProcedureOutput = z.infer<typeof GenerateSafeWorkProcedureOutputSchema>;

export async function generateSafeWorkProcedure(input: GenerateSafeWorkProcedureInput): Promise<GenerateSafeWorkProcedureOutput> {
  return generateSafeWorkProcedureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafeWorkProcedurePrompt',
  input: {schema: GenerateSafeWorkProcedureInputSchema},
  output: {schema: GenerateSafeWorkProcedureOutputSchema},
  prompt: `You are an expert safety officer responsible for creating safe work procedures.

  Based on the information provided, generate a comprehensive safe work procedure document.

  Task Description: {{{taskDescription}}}
  Potential Hazards: {{{potentialHazards}}}
  Control Measures: {{{controlMeasures}}}
  Required Equipment: {{{requiredEquipment}}}
  Step-by-Step Procedure: {{{stepByStepProcedure}}}
  Emergency Procedures: {{{emergencyProcedures}}}
  `,
});

const generateSafeWorkProcedureFlow = ai.defineFlow(
  {
    name: 'generateSafeWorkProcedureFlow',
    inputSchema: GenerateSafeWorkProcedureInputSchema,
    outputSchema: GenerateSafeWorkProcedureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
