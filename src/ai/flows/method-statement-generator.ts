'use server';

/**
 * @fileOverview Generates method statements by guiding the user through a series of questions.
 *
 * - generateMethodStatement - A function that initiates the method statement generation process.
 * - MethodStatementInput - The input type for the generateMethodStatement function.
 * - MethodStatementOutput - The return type for the generateMethodStatement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MethodStatementInputSchema = z.object({
  taskDescription: z.string().describe('A detailed description of the task for which the method statement is being generated.'),
  location: z.string().describe('The location where the task will be performed.'),
  equipmentUsed: z.string().describe('A list of equipment that will be used during the task.'),
  stepByStepInstructions: z.string().describe('Step by step instructions on how to conduct the task safely.'),
  riskAssessment: z.string().describe('A list of potential risks associated with the task.'),
  controlMeasures: z.string().describe('Control measures to mitigate identified risks.'),
  emergencyProcedures: z.string().describe('Emergency procedures in case of an incident.'),
  personnelTraining: z.string().describe('Details of required training for personnel involved.'),
});

export type MethodStatementInput = z.infer<typeof MethodStatementInputSchema>;

const MethodStatementOutputSchema = z.object({
  methodStatement: z.string().describe('The complete method statement document.'),
});

export type MethodStatementOutput = z.infer<typeof MethodStatementOutputSchema>;

export async function generateMethodStatement(input: MethodStatementInput): Promise<MethodStatementOutput> {
  return methodStatementGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'methodStatementGeneratorPrompt',
  input: {schema: MethodStatementInputSchema},
  output: {schema: MethodStatementOutputSchema},
  prompt: `You are an AI assistant specialized in generating method statements according to South African OHS Act standards.

  Based on the information provided, create a comprehensive method statement document.

  Task Description: {{{taskDescription}}}
  Location: {{{location}}}
  Equipment Used: {{{equipmentUsed}}}
  Step-by-Step Instructions: {{{stepByStepInstructions}}}
  Risk Assessment: {{{riskAssessment}}}
  Control Measures: {{{controlMeasures}}}
  Emergency Procedures: {{{emergencyProcedures}}}
  Personnel Training: {{{personnelTraining}}}

  Ensure that the method statement includes all necessary sections and complies with relevant safety regulations.
  The method statement should be detailed, clear, and easy to understand.
  Follow the standard format for method statements, including:
  1. Task Description
  2. Location
  3. Equipment
  4. Step-by-step Instructions
  5. Risk Assessment
  6. Control Measures
  7. Emergency Procedures
  8. Personnel Training

  Generate the complete method statement document:
  `, 
});

const methodStatementGeneratorFlow = ai.defineFlow(
  {
    name: 'methodStatementGeneratorFlow',
    inputSchema: MethodStatementInputSchema,
    outputSchema: MethodStatementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
