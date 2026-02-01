"use client";

import Link from "next/link";

export function HomeClient() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <>
      <Link
        href="/chat"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Chat
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Log out
      </button>
    </>
  );
}
