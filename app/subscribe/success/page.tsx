import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-muted/20 to-transparent">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
          Thank you
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Your subscription is active. You can now use the chat feature.
        </p>
        <Link
          href="/chat"
          className="inline-block w-full rounded-2xl bg-accent py-3.5 text-center text-sm font-semibold text-accent-foreground shadow-soft transition-colors hover:bg-accent/90"
        >
          Go to Chat
        </Link>
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-accent hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
