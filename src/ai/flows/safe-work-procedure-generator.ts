
'use server';

/**
 * @fileOverview An AI agent for generating OSHA-compliant Safe Work Procedure (SWP) documents.
 *
 * - generateSafeWorkProcedure - A function that handles the SWP generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSafeWorkProcedureInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task or operation.'),
  companyName: z.string().describe('The name of the company.'),
  preparedBy: z.string().describe('Name of the person preparing the SWP.'),
  reviewDate: z.string().describe('The next scheduled review date.'),
  scope: z.string().describe('A detailed summary of the scope and application of this procedure, including locations and personnel involved.'),
  hazards: z.string().describe('A detailed summary of identified hazards and risks associated with the task.'),
  ppe: z.string().describe('A comprehensive list of all required Personal Protective Equipment (PPE).'),
  procedure: z.array(z.string()).describe('An array of strings, where each string is a single step in the safe work procedure.'),
  emergencyProcedures: z.string().describe('A detailed description of actions to take in case of various emergencies.'),
});
type GenerateSafeWorkProcedureInput = z.infer<typeof GenerateSafeWorkProcedureInputSchema>;

// This schema includes the values we'll calculate in the flow.
const GenerateSafeWorkProcedurePromptInputSchema = GenerateSafeWorkProcedureInputSchema.extend({
    documentNumber: z.string(),
    effectiveDate: z.string(),
});

const GenerateSafeWorkProcedureOutputSchema = z.object({
  swpDocument: z.string().describe('The complete, OSHA-compliant Safe Work Procedure document in Markdown format.'),
});
type GenerateSafeWorkProcedureOutput = z.infer<typeof GenerateSafeWorkProcedureOutputSchema>;

export async function generateSafeWorkProcedure(input: GenerateSafeWorkProcedureInput): Promise<GenerateSafeWorkProcedureOutput> {
  return generateSafeWorkProcedureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafeWorkProcedurePrompt',
  input: {schema: GenerateSafeWorkProcedurePromptInputSchema},
  output: {schema: GenerateSafeWorkProcedureOutputSchema},
  prompt: `You are an expert safety officer specializing in creating legally compliant, OSHA-adherent Safe Work Procedure (SWP) documents. Your task is to generate a professional SWP document in Markdown format based on the provided data.

The document must follow this exact structure:

## Document Generation Start

# **Safe Work Procedure: {{{taskTitle}}}**

---

### **1. Document Control**
- **Company:** {{{companyName}}}
- **Document Title:** Safe Work Procedure - {{{taskTitle}}}
- **Document Number:** {{{documentNumber}}}
- **Effective Date:** {{{effectiveDate}}}
- **Prepared By:** {{{preparedBy}}}
- **Next Review Date:** {{{reviewDate}}}

| Approval Role       | Name | Signature | Date |
|---------------------|------|-----------|------|
| **Safety Manager**  |      |           |      |
| **Department Head** |      |           |      |

---

### **2. Scope and Application**
{{{scope}}}

---

### **3. Regulatory References**
This procedure adheres to the principles outlined in the Occupational Safety and Health Act (OSHA), specifically referencing standards relevant to the tasks described herein, including but not limited to 29 CFR 1910 (General Industry) and/or 29 CFR 1926 (Construction). All personnel are required to comply with these and any applicable state or local regulations.

---

### **4. Hazard Identification and Risk Assessment**
A full Hazard Identification and Risk Assessment (HIRA) must be completed and understood by all personnel before commencing this task. Key hazards associated with this work include, but are not limited to:
{{{hazards}}}

---

### **5. Personal Protective Equipment (PPE)**
The following Personal Protective Equipment is mandatory for all personnel performing this task, as per OSHA standards (29 CFR 1910.132). All PPE must be inspected prior to use and maintained in good condition.
{{{ppe}}}

---

### **6. Step-by-Step Procedure**
The following steps must be followed in sequence to ensure the task is completed safely. Any deviation from this procedure requires authorization from a supervisor.

{{#each procedure}}
{{add @index 1}}. {{{this}}}
{{/each}}

---

### **7. Emergency Procedures**
In the event of an emergency, all work must cease immediately. Follow these procedures:
{{{emergencyProcedures}}}

**Emergency Contact Information:**
- **Site Supervisor:** [Enter Name and Number]
- **Emergency Services (Call):** [Enter Local Emergency Number, e.g., 911]

---

### **8. Training and Acknowledgment**
All personnel assigned to this task must be trained on this Safe Work Procedure prior to beginning work. By signing below, you acknowledge that you have read, understood, and agree to comply with this SWP in its entirety.

| Employee Name | Signature | Date |
|---------------|-----------|------|
|               |           |      |
|               |           |      |
|               |           |      |

## Document Generation End
`,
});

const generateSafeWorkProcedureFlow = ai.defineFlow(
  {
    name: 'generateSafeWorkProcedureFlow',
    inputSchema: GenerateSafeWorkProcedureInputSchema,
    outputSchema: GenerateSafeWorkProcedureOutputSchema,
  },
  async (input) => {
    // Generate dynamic values here instead of in the prompt template.
    const documentNumber = `SWP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
    const effectiveDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const promptInput = {
        ...input,
        documentNumber,
        effectiveDate,
    };
    
    const {output} = await prompt(promptInput);

    return { swpDocument: output!.swpDocument };
  }
);
