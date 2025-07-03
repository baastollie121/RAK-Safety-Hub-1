'use server';

/**
 * @fileOverview An AI agent for generating Site Safety, Health, and Environment (SHE) plans.
 *
 * - generateShePlan - A function that handles the SHE plan generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShePlanInputSchema = z.object({
  companyName: z.string().describe('The name of the company or organization.'),
  projectTitle: z.string().describe('The title of the project being assessed.'),
  projectLocation: z.string().describe('The physical location of the project.'),
  preparedBy: z.string().describe('The name or title of the person preparing the plan.'),
  reviewDate: z.string().describe('The scheduled review date for this SHE plan.'),
  projectOverview: z.string().describe('A detailed overview of the project scope, timeline, and characteristics.'),
  siteHazards: z.string().describe('A summary of site-specific hazards identified (e.g., falls, electrical, excavation).'),
  emergencyProcedures: z.string().describe('A summary of emergency response procedures for incidents like medical, fire, or spills.'),
  ppeRequirements: z.string().describe('A description of minimum and task-specific Personal Protective Equipment (PPE).'),
  trainingRequirements: z.string().describe('A summary of mandatory training and competency requirements for the site.'),
  environmentalControls: z.string().describe('A description of controls for environmental hazards like waste, dust, and water.'),
});
export type GenerateShePlanInput = z.infer<typeof GenerateShePlanInputSchema>;

const GenerateShePlanPromptInputSchema = GenerateShePlanInputSchema.extend({
    preparationDate: z.string(),
});
export type GenerateShePlanPromptInput = z.infer<typeof GenerateShePlanPromptInputSchema>;


const GenerateShePlanOutputSchema = z.object({
  shePlanDocument: z.string().describe('A professionally formatted, comprehensive SHE Site Plan document in Markdown format.'),
});
export type GenerateShePlanOutput = z.infer<typeof GenerateShePlanOutputSchema>;

export async function generateShePlan(input: GenerateShePlanInput): Promise<GenerateShePlanOutput> {
  return generateShePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShePlanPrompt',
  input: {schema: GenerateShePlanPromptInputSchema},
  output: {schema: GenerateShePlanOutputSchema},
  prompt: `You are an expert safety manager creating a Site Safety, Health, and Environment (SHE) Plan. Your task is to generate a professional SHE plan in Markdown format based on the provided data.

The document must follow a clear, professional structure. Use the provided information to populate each section. Where appropriate, expand on the user's input with standard safety boilerplate language to ensure the document is comprehensive.

## Document Generation Start

# **Site Safety, Health, and Environment (SHE) Plan**

---

### **1. Cover Page & Document Control**

*   **Company/Organization:** {{{companyName}}}
*   **Project Title:** {{{projectTitle}}}
*   **Project Location:** {{{projectLocation}}}
*   **Document Title:** Site Safety Plan
*   **Prepared By:** {{{preparedBy}}}
*   **Preparation Date:** {{{preparationDate}}}
*   **Next Review Date:** {{{reviewDate}}}

| Approval Role         | Name       | Signature | Date |
| --------------------- | ---------- | --------- | ---- |
| **Project Manager**   |            |           |      |
| **Safety Manager**    |            |           |      |
| **Client Acceptance** |            |           |      |

---

### **2. Executive Summary**

This Site Safety, Health, and Environment (SHE) Plan outlines the policies, procedures, and practices to ensure a safe and healthy work environment for the "{{projectTitle}}". The primary objective is the prevention of incidents, injuries, and illnesses. This plan details the key hazards, control measures, and emergency procedures to be followed by all personnel on site.

---

### **3. Project Overview**

{{{projectOverview}}}

---

### **4. Site-Specific Hazard Analysis**

A full Hazard Identification and Risk Assessment (HIRA) should be conducted for all tasks. The following key site-specific hazards have been identified and must be controlled:

{{{siteHazards}}}

---

### **5. Personal Protective Equipment (PPE)**

All personnel entering the site must adhere to the minimum PPE requirements. Additional task-specific PPE will be required as determined by the relevant risk assessments.

{{{ppeRequirements}}}

---

### **6. Training and Competency**

All personnel must be competent and trained for their assigned tasks. The following training requirements are mandatory for this site:

{{{trainingRequirements}}}

---

### **7. Emergency Response Procedures**

In the event of an emergency, the following procedures must be followed. All personnel must be familiarized with these plans during site induction.

{{{emergencyProcedures}}}

**Emergency Contact Numbers:**
*   **Ambulance / Fire / Police:** [Enter Local Emergency Number, e.g., 911 or 10177]
*   **Site Safety Officer:** [Enter Name and Number]
*   **Project Manager:** [Enter Name and Number]
*   **Local Hospital:** [Enter Hospital Name and Number]

---

### **8. Environmental Controls**

The project is committed to minimizing its environmental impact. The following controls will be implemented:

{{{environmentalControls}}}

---

### **9. Incident Management**

All incidents, including near misses, must be reported immediately to the site supervisor. A thorough investigation will be conducted to determine the root cause and prevent recurrence.

---

### **10. Approval & Sign-Off**

I, the undersigned, confirm that I have read and understood the contents of this Site SHE Plan and agree to comply with all its requirements.

| Role                  | Name       | Signature | Date |
| --------------------- | ---------- | --------- | ---- |
|                       |            |           |      |
|                       |            |           |      |
|                       |            |           |      |

## Document Generation End
`,
});

const generateShePlanFlow = ai.defineFlow(
  {
    name: 'generateShePlanFlow',
    inputSchema: GenerateShePlanInputSchema,
    outputSchema: GenerateShePlanOutputSchema,
  },
  async input => {
    const preparationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const promptInput = { ...input, preparationDate };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
