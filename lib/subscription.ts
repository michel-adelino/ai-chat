import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SubscriptionStatus = "active" | "inactive" | "past_due" | "canceled";

/** Call from server. Returns user row; redirects to /login if not authenticated, to /paywall if no active subscription. */
export async function requireSubscription(): Promise<{
  userId: string;
  email: string | null;
  subscriptionStatus: SubscriptionStatus;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/chat");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const status = (profile?.subscription_status ?? "inactive") as SubscriptionStatus;
  if (status !== "active") {
    redirect("/paywall");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    subscriptionStatus: status,
  };
}
