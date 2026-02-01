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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-muted/20 to-transparent">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
          Subscription required
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          To use the chat feature, you need an active subscription. Subscribe
          below to get started.
        </p>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-accent-foreground shadow-soft transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Subscribe now"}
        </button>
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-accent hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
