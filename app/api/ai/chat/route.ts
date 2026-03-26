import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    const systemPrompt = `
You are NyayaSetu Assistant, a helpful civic assistant for Delhi citizens.

Rules:
- Keep responses under 150 words.
- If user writes in Hindi, respond in Hindi.
- If asked about complaint status, tell them to use tracking page.
- Do not invent government schemes.
`;

    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({text:content})}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  } catch (error) {
    console.error("Groq chat error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
