
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

const HazardInputSchema = z.object({
    hazard: z.string().describe('Specific hazard description'),
    personsAffected: z.string().describe('Who could be affected and potential injuries'),
    initialLikelihood: z.number().describe('Initial likelihood rating (0-5)'),
    initialConsequence: z.number().describe('Initial consequence rating (0-5)'),
    controlMeasures: z.string().describe('Specific safety measures for this hazard'),
    residualLikelihood: z.number().describe('Residual likelihood rating (0-5)'),
    residualConsequence: z.number().describe('Residual consequence rating (0-5)'),
});

const HazardPromptSchema = HazardInputSchema.extend({
    initialRisk: z.number().describe('Calculated Initial Risk (Likelihood * Consequence)'),
    residualRisk: z.number().describe('Calculated Residual Risk (Likelihood * Consequence)'),
});

const GenerateRiskAssessmentInputSchema = z.object({
  companyName: z.string().describe('The name of the company or organization.'),
  taskTitle: z.string().describe('The title of the task or project being assessed.'),
  siteLocation: z.string().describe('The physical location of the site or project.'),
  reviewDate: z.string().describe('The scheduled review date for this HIRA.'),
  hazards: z.array(HazardInputSchema).describe('A list of identified hazards and their assessments.'),
});
export type GenerateRiskAssessmentInput = z.infer<typeof GenerateRiskAssessmentInputSchema>;

const GenerateRiskAssessmentPromptInputSchema = z.object({
    companyName: z.string(),
    taskTitle: z.string(),
    siteLocation: z.string(),
    reviewDate: z.string(),
    hazards: z.array(HazardPromptSchema),
});

const GenerateRiskAssessmentOutputSchema = z.object({
  riskAssessmentDocument: z.string().describe('A professionally formatted, South African OHS Act-compliant HIRA document in Markdown format.'),
});
export type GenerateRiskAssessmentOutput = z.infer<typeof GenerateRiskAssessmentOutputSchema>;

export async function generateRiskAssessment(input: GenerateRiskAssessmentInput): Promise<GenerateRiskAssessmentOutput> {
  return generateRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRiskAssessmentPrompt',
  input: {schema: GenerateRiskAssessmentPromptInputSchema},
  output: {schema: GenerateRiskAssessmentOutputSchema},
  prompt: `You are an expert safety officer specializing in creating South African OHS Act-compliant Hazard Identification and Risk Assessment (HIRA) documents. Your task is to generate a professional HIRA document in Markdown format based on the provided data.

The document must follow this exact structure:
1.  **Header Section**: Include the company name, task title, and site location.
2.  **Contents/Hazards List**: Create a numbered list of all identified hazard descriptions.
3.  **Generic Control Measures Section**: Include the standard safety measures provided below.
4.  **Risk Assessment Matrix Explanation**: Include the provided explanation of the risk matrix.
5.  **Detailed Hazard Analysis Table**: Create a Markdown table with the specified columns, populating it with the hazard data provided. You have been provided with the pre-calculated risk ratings.
6.  **Approval Section**: Include the review date and signature blocks.

## Document Generation Start

**Company:** {{{companyName}}}
**Task/Project:** {{{taskTitle}}}
**Site Location:** {{{siteLocation}}}

---

### Task HIRA

**Contents/Hazards:**
{{#each hazards}}
1. {{{this.hazard}}}
{{/each}}

---

### Generic Control Measures

- **Competency and Training**: All personnel must be competent and trained for their assigned tasks.
- **Equipment Inspections**: Daily pre-use inspections of all tools and equipment are mandatory.
- **System Compliance**: Adherence to all established safety systems, including RAMS (Risk Assessment Method Statements), permits, and traffic management plans.
- **Equipment Maintenance**: All equipment must be maintained in accordance with manufacturer instructions.
- **Information and Communication**: Regular toolbox talks and safety briefings will be conducted.
- **Signage**: Adequate safety signage must be in place and visible.
- **Disciplinary Action**: Non-compliance with safety procedures will result in disciplinary action.
- **Personal Protective Equipment (PPE)**: Mandatory use of required PPE at all times.
- **Defective Equipment**: Any defective equipment must be immediately removed from service, tagged, and reported.

---

### Risk Assessment Matrix

The risk assessment is conducted using the following matrix:

**Step 1: Likelihood Rating (L)**
- 0: Impossible
- 1: Almost impossible
- 2: Highly unlikely
- 3: Unlikely
- 4: Possible
- 5: Even chance

**Step 2: Consequence/Severity Rating (S)**
- 0: No injury
- 1: Minor first aid injury
- 2: Break bone/minor illness/1st-2nd degree burns
- 3: Break bone/minor illness/3rd-4th degree burns over 50% body
- 4: Loss of limb/eye/serious illness/50%+ burns
- 5: Fatality

**Step 3: Risk Rating (R) = Likelihood × Consequence**

**Action Requirements:**
- **16-25 (High Risk - RED)**: Stop work immediately. The risk must be reduced before work can proceed.
- **6-15 (Medium Risk - YELLOW)**: Introduce and implement control measures to reduce the risk to a lower level.
- **0-5 (Low Risk - GREEN)**: No immediate action required, but monitoring is recommended.

---

### Detailed Hazard Analysis

| Hazards | Persons Affected & Likely Harm | Initial Risk (L-S-R) | Additional Control Measures | Residual Risk (L-S-R) |
|---|---|---|---|---|
{{#each hazards}}
| {{{this.hazard}}} | {{{this.personsAffected}}} | {{this.initialLikelihood}} - {{this.initialConsequence}} - **{{this.initialRisk}}** | {{{this.controlMeasures}}} | {{this.residualLikelihood}} - {{this.residualConsequence}} - **{{this.residualRisk}}** |
{{/each}}

---

### Approval and Review

**Next Review Date:** {{{reviewDate}}}

| Role | Name | Signature | Date |
|------|-----------|-----------|------|
| **Compiled By** | | | |
| **Approved By** | | | |
| **Client** | | | |

## Document Generation End
`,
});

const generateRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'generateRiskAssessmentFlow',
    inputSchema: GenerateRiskAssessmentInputSchema,
    outputSchema: GenerateRiskAssessmentOutputSchema,
  },
  async (input) => {
    // Calculate risk ratings before sending to the prompt
    const processedHazards = input.hazards.map(h => ({
        ...h,
        initialRisk: h.initialLikelihood * h.initialConsequence,
        residualRisk: h.residualLikelihood * h.residualConsequence,
    }));
    
    const promptInput = {
      ...input,
      hazards: processedHazards,
    };

    const {output} = await prompt(promptInput);
    return output!;
  }
);
