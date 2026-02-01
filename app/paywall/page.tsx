"use client";

import Link from "next/link";
import { useState } from "react";

export default function PaywallPage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (!res.ok) {
        alert(data.error ?? "Checkout failed");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-black/[.08] bg-white p-8 text-center dark:border-white/[.145] dark:bg-black/[.2]">
        <h1 className="text-2xl font-semibold">Subscription required</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          To use the chat feature, you need an active subscription. Subscribe
          below to get started.
        </p>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full rounded bg-foreground py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Subscribe now"}
        </button>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          <Link href="/" className="underline hover:no-underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
