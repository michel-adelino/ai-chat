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
      <header className="border-b border-border bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-4">
          {user ? (
            <HomeClient />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition-colors hover:bg-accent/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI Chat
          </h1>
          <p className="text-lg text-muted-foreground">
            Chat with AI. Sign in and subscribe to get started.
          </p>

          {!user && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-colors hover:bg-accent/90"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground shadow-soft transition-colors hover:bg-muted/50"
              >
                Sign up
              </Link>
            </div>
          )}

          {user && !isSubscribed && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Subscribe to access the chat.
              </p>
              <Link
                href="/paywall"
                className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-colors hover:bg-accent/90"
              >
                Subscribe
              </Link>
            </div>
          )}

          {user && isSubscribed && (
            <Link
              href="/chat"
              className="inline-block rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-colors hover:bg-accent/90"
            >
              Go to Chat
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
