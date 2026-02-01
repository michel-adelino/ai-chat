import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-black/[.08] bg-white p-8 text-center dark:border-white/[.145] dark:bg-black/[.2]">
        <h1 className="text-2xl font-semibold">Thank you</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your subscription is active. You can now use the chat feature.
        </p>
        <Link
          href="/chat"
          className="inline-block w-full rounded bg-foreground py-3 text-center text-sm font-medium text-background hover:opacity-90"
        >
          Go to Chat
        </Link>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          <Link href="/" className="underline hover:no-underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
