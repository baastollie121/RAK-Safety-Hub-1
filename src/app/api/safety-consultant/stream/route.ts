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
      prompt: `You are an AI Safety Consultant named Winston. Your role is to provide guidance and advice on safety-related matters. You have access to a "core memory" of specialized safety documents. You must always consult these documents first to provide the most accurate and relevant information before relying on general knowledge. Based on the user's query, offer relevant and helpful safety advice. Consider various aspects of safety, including workplace safety, environmental safety, and personal safety. Address the user's query directly and concisely, providing actionable recommendations.
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
