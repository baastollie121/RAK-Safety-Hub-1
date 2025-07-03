'use server';

/**
 * @fileOverview Generates legally compliant, OSHA-adherent Method Statement documents.
 *
 * - generateMethodStatement - A function that handles the Method Statement generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMethodStatementInputSchema = z.object({
  companyName: z.string().describe('The name of the company or organization.'),
  projectTitle: z.string().describe('The title of the project or contract.'),
  taskTitle: z.string().describe('The specific task or operation this method statement covers.'),
  preparedBy: z.string().describe('Name of the person preparing the document.'),
  reviewDate: z.string().describe('The next scheduled review date for this document.'),
  scope: z.string().describe('A detailed description of the work, its boundaries, and personnel involved.'),
  hazards: z.string().describe('A summary of key hazards identified from the JHA/HIRA for this task.'),
  ppe: z.string().describe('A comprehensive list of all mandatory and task-specific Personal Protective Equipment (PPE).'),
  procedure: z.array(z.string()).describe('An array of strings, where each string is a single, sequential step in the work method.'),
  equipment: z.string().describe('A list of all tools, machinery, and equipment required for the task.'),
  training: z.string().describe('A summary of required training, qualifications, and competencies for personnel.'),
  monitoring: z.string().describe('A description of how the work will be monitored for safety and compliance.'),
  emergencyProcedures: z.string().describe('A detailed description of actions to take in case of various emergencies relevant to the task.'),
});

// This schema includes the values we'll calculate in the flow.
const GenerateMethodStatementPromptInputSchema = GenerateMethodStatementInputSchema.extend({
    documentNumber: z.string(),
    effectiveDate: z.string(),
});

const GenerateMethodStatementOutputSchema = z.object({
  methodStatementDocument: z.string().describe('The complete, OSHA-compliant Method Statement document in Markdown format.'),
});

export async function generateMethodStatement(input: z.infer<typeof GenerateMethodStatementInputSchema>): Promise<z.infer<typeof GenerateMethodStatementOutputSchema>> {
  return generateMethodStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMethodStatementPrompt',
  input: {schema: GenerateMethodStatementPromptInputSchema},
  output: {schema: GenerateMethodStatementOutputSchema},
  prompt: `You are an expert safety manager specializing in creating legally compliant, OSHA-adherent Method Statement documents. Your task is to generate a professional Method Statement in Markdown format based on the provided data.

The document must be comprehensive and follow a logical structure compliant with safety management best practices.

## Document Generation Start

# **Method Statement: {{{taskTitle}}}**

---

### **1. Document Control & Legal Information**
- **Company:** {{{companyName}}}
- **Project Reference:** {{{projectTitle}}}
- **Document Title:** Method Statement - {{{taskTitle}}}
- **Document Number:** {{{documentNumber}}}
- **Effective Date:** {{{effectiveDate}}}
- **Prepared By:** {{{preparedBy}}}
- **Next Review Date:** {{{reviewDate}}}

| Approval Role       | Name | Signature | Date |
|---------------------|------|-----------|------|
| **Project Manager** |      |           |      |
| **Safety Manager**  |      |           |      |

---

### **2. Scope of Work**
{{{scope}}}

---

### **3. Regulatory & Standards Compliance**
This Method Statement is developed in accordance with the Occupational Safety and Health Act (OSHA) General Duty Clause (Section 5(a)(1)). It integrates principles from relevant OSHA standards, including but not limited to 29 CFR 1926 (Construction) and 29 CFR 1910 (General Industry). All work must comply with these regulations and any applicable state or local codes.

---

### **4. Hazard Identification and Risk Assessment (HIRA)**
A full Job Hazard Analysis (JHA) or Hazard Identification and Risk Assessment (HIRA) must be completed, understood, and signed by all personnel before commencing this task. This Method Statement serves as the primary administrative control for the identified risks.

**Key hazards associated with this work include, but are not limited to:**
{{{hazards}}}

The hierarchy of controls has been applied to manage these risks. Where hazards cannot be eliminated or substituted, engineering and administrative controls, followed by Personal Protective Equipment (PPE), are the primary means of risk reduction.

---

### **5. Personal Protective Equipment (PPE)**
The following PPE is mandatory for all personnel performing this task, as per the site-specific PPE assessment and OSHA standards. All PPE must be inspected prior to use and maintained in good condition.

{{{ppe}}}

---

### **6. Equipment & Resources**
Only authorized and inspected equipment shall be used for this task. All equipment must be suitable for its intended purpose and used in accordance with manufacturer's instructions.

**Required Equipment:**
{{{equipment}}}

---

### **7. Step-by-Step Work Procedure**
The following steps must be followed in sequence to ensure the task is completed safely, efficiently, and to the required quality standard. Any deviation from this procedure requires a Stop Work Authority review and formal authorization from a supervisor.

{{#each procedure}}
{{add @index 1}}. {{{this}}}
{{/each}}

---

### **8. Training & Competency**
All personnel assigned to this task must be trained on this Method Statement and be competent to perform their assigned duties. Records of training and competency must be maintained.

**Required Training & Competencies:**
{{{training}}}

---

### **9. Supervision & Monitoring**
Continuous monitoring will be in place to ensure compliance with this Method Statement.

{{{monitoring}}}

---

### **10. Emergency Procedures**
In the event of an emergency, all work must cease immediately. The site-specific Emergency Action Plan must be followed.

**Task-Specific Emergency Actions:**
{{{emergencyProcedures}}}

**Emergency Contact Information:**
- **Site Supervisor:** [Enter Name and Number]
- **Emergency Services (Call):** [Enter Local Emergency Number, e.g., 911]
- **Safety Officer:** [Enter Name and Number]

---

### **11. Worker Acknowledgment**
By signing below, you acknowledge that you have read, understood, and agree to comply with this Method Statement in its entirety. You confirm you have received the necessary training and will raise any safety concerns with your supervisor.

| Employee Name | Signature | Date |
|---------------|-----------|------|
|               |           |      |
|               |           |      |
|               |           |      |

## Document Generation End
`,
});

const generateMethodStatementFlow = ai.defineFlow(
  {
    name: 'generateMethodStatementFlow',
    inputSchema: GenerateMethodStatementInputSchema,
    outputSchema: GenerateMethodStatementOutputSchema,
  },
  async (input) => {
    // Generate dynamic values here
    const documentNumber = `MS-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
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

    return { methodStatementDocument: output!.methodStatementDocument };
  }
);
