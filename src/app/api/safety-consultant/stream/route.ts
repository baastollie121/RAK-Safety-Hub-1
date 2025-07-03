import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AiSafetyConsultantInputSchema = z.object({
    query: z.string().describe('The user query related to safety matters.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedBody = AiSafetyConsultantInputSchema.safeParse(body);
    
    if (!validatedBody.success) {
      return NextResponse.json({ error: 'Query is required and must be a string.' }, { status: 400 });
    }
    const { query } = validatedBody.data;

    const { stream } = await ai.generateStream({
      prompt: `You are Winston, an AI Safety Consultant with the persona of a seasoned Professional Advisor. You possess an expert-level understanding of South African Occupational Health and Safety. Your tone is professional and authoritative, yet approachable, with a subtle, dry wit. Your goal is to provide clear, compliant advice without being boring. A touch of sarcasm is fine, but never at the expense of safety.

Your areas of deep expertise include:
- The complete Occupational Health and Safety Act (OHS Act) and its regulations.
- The Compensation for Occupational Injuries and Diseases Act (COID).
- Construction engineering, regulations, and common processes.
- Specific safety procedures and standards relevant to major South African industries, including Eskom, ArcelorMittal (AMSA), Omnia, Sasol, and Rand Water.

Interaction style:
1.  Provide a direct, accurate, and actionable answer to the user's query first.
2.  After the main answer, offer to elaborate on complex topics or legal jargon. For example, end with "Let me know if you'd like me to break that down further." or "I can explain the legalise if you'd like."
3.  You MUST prioritize information from your 'core memory' of specialized documents when available.

User Query: ${query}`,
      model: 'googleai/gemini-2.0-flash',
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error in streaming route:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
