"use client";

import { MarkdownMessage } from "./MarkdownMessage";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

function CopyButton({
  content,
  copied,
  onCopy,
}: {
  content: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (content) {
          navigator.clipboard.writeText(content);
          onCopy();
        }
      }}
      aria-label={copied ? "Copied" : "Copy response"}
      className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? (
        <>
          <CheckIcon className="h-3.5 w-3.5 shrink-0" />
          Copied!
        </>
      ) : (
        <>
          <ClipboardIcon className="h-3.5 w-3.5 shrink-0" />
          Copy
        </>
      )}
    </button>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-12a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback((index: number) => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    setCopiedMessageIndex(index);
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedMessageIndex(null);
      copyTimeoutRef.current = null;
    }, 1500);
  }, []);

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
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Chat</h1>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Send a message to start.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-foreground/10 px-4 py-3 shadow-soft dark:bg-foreground/15"
                  : "mr-auto max-w-[85%] rounded-2xl bg-card border border-border px-4 py-3 shadow-soft"
              }
            >
              {m.role === "user" ? (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content || "…"}</p>
              ) : (
                <>
                  <MarkdownMessage content={m.content} />
                  <CopyButton
                    content={m.content}
                    copied={copiedMessageIndex === i}
                    onCopy={() => handleCopy(i)}
                  />
                </>
              )}
            </div>
          ))}
          {error && (
            <div className="rounded-2xl border-l-4 border-red-500 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>

      <form
        className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur-sm"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div className="mx-auto flex max-w-3xl gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={loading}
            className="min-h-[48px] flex-1 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-[15px] placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </>
  );
}
