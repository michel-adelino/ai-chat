import { createClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/env";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const env = getEnv();
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI not configured" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const status = profile?.subscription_status ?? "inactive";
    if (status !== "active") {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    let body: { messages?: OpenAI.Chat.ChatCompletionMessageParam[]; stream?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const messages = body.messages ?? [];
    const stream = body.stream ?? true;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const delta = chunk.choices[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            }
          } catch (err) {
            console.error("OpenAI stream error:", err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: false,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ message: { role: "assistant" as const, content } });
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      const status = err.status ?? 500;
      const message = err.message ?? "OpenAI API error";
      return NextResponse.json(
        { error: message },
        { status: status >= 400 ? status : 500 }
      );
    }
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
