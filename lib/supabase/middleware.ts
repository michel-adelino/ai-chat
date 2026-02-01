import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup";
  const isWebhook = request.nextUrl.pathname === "/api/webhooks/stripe";
  const isProtected =
    request.nextUrl.pathname.startsWith("/chat") ||
    request.nextUrl.pathname.startsWith("/paywall") ||
    request.nextUrl.pathname.startsWith("/subscribe");

  if (isWebhook) {
    return NextResponse.next({ request });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAuthPage && user) {
    const redirectUrl = new URL("/", request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value));
    return redirectResponse;
  }

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value));
    return redirectResponse;
  }

  return response;
}
