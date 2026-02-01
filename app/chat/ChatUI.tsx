"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, stream: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { ...last, content: assistantContent };
          }
          return next;
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <>
      <header className="border-b border-black/[.08] dark:border-white/[.145] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Chat</h1>
        <Link
          href="/"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          Home
        </Link>
      </header>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-8">
            Send a message to start.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-foreground/10 dark:bg-foreground/15 px-4 py-2"
                : "mr-auto max-w-[85%] rounded-lg bg-black/[.05] dark:bg-white/[.08] px-4 py-2"
            }
          >
            <p className="text-sm whitespace-pre-wrap">{m.content || "…"}</p>
          </div>
        ))}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </div>

      <form
        className="border-t border-black/[.08] dark:border-white/[.145] p-4"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={loading}
            className="flex-1 rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </>
  );
}
