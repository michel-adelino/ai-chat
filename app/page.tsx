import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HomeClient } from "./HomeClient";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subscriptionStatus: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();
    subscriptionStatus = data?.subscription_status ?? null;
  }

  const isSubscribed = subscriptionStatus === "active";

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-black/[.08] dark:border-white/[.145] px-4 py-3 flex items-center justify-end gap-4">
        {user ? (
          <HomeClient />
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:opacity-80"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Sign up
            </Link>
          </>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <h1 className="text-3xl font-bold text-center">AI Chat</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          Chat with AI. Sign in and subscribe to get started.
        </p>

        {!user && (
          <div className="flex gap-4">
            <Link
              href="/login"
              className="rounded bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded border border-black/[.08] dark:border-white/[.145] px-5 py-2.5 text-sm font-medium hover:bg-black/[.05] dark:hover:bg-white/[.05]"
            >
              Sign up
            </Link>
          </div>
        )}

        {user && !isSubscribed && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Subscribe to access the chat.
            </p>
            <Link
              href="/paywall"
              className="rounded bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              Subscribe
            </Link>
          </div>
        )}

        {user && isSubscribed && (
          <Link
            href="/chat"
            className="rounded bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Go to Chat
          </Link>
        )}
      </main>
    </div>
  );
}
