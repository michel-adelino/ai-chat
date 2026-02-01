# AI Chat MVP

A production-ready ChatGPT-style web app with Supabase Auth, Stripe subscriptions, and OpenAI chat (with streaming). Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Deployable on Vercel.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Auth, Postgres with RLS)
- **Stripe** (Checkout, Subscriptions, Webhooks)
- **OpenAI** (Chat API, streaming)
- **Tailwind CSS**
- **Vercel** (deployment)

## Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)
- [Supabase](https://supabase.com) project
- [Stripe](https://stripe.com) account
- [OpenAI](https://platform.openai.com) API key

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. Required and optional vars:

| Variable | Required | Where to get it |
|----------|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | For webhooks | Same (use only in server; never expose to client) |
| `STRIPE_SECRET_KEY` | For checkout | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For Stripe.js (if used) | Same |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe Dashboard → Webhooks, or `stripe listen` for local |
| `OPENAI_API_KEY` | For chat | [OpenAI API keys](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_APP_URL` | Recommended | Your app URL (e.g. `http://localhost:3000` locally) |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | For checkout | Stripe Dashboard → Products → create Product + Price (recurring) |

`.env.local` is gitignored; use it for local development. In production (e.g. Vercel), set these in Project Settings → Environment Variables.

## Local setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - In SQL Editor, run the contents of `supabase/schema.sql` to create the `users` table, RLS policies, and the trigger that creates a user row on signup.

3. **Stripe**

   - Create a Product and a recurring Price; note the Price ID and set `NEXT_PUBLIC_STRIPE_PRICE_ID`.
   - For local webhook testing, use the Stripe CLI:
     ```bash
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
   - Set `STRIPE_WEBHOOK_SECRET` in `.env.local` to the signing secret printed by the CLI.

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Stripe configuration

- **Webhook events** (subscribe in Stripe Dashboard or CLI):  
  `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- **Production webhook URL**: `https://<your-vercel-domain>/api/webhooks/stripe`
- **Local**: Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and the CLI secret in `.env.local`.
- Webhook handler verifies the signature using the raw request body and updates the Supabase `users` table (subscription status, Stripe customer/subscription IDs).

## Deployment (Vercel)

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add all environment variables in Vercel (Project Settings → Environment Variables). Use the **production** Stripe webhook signing secret for the deployed URL.
3. Deploy. After the first deploy, in Stripe Dashboard add a webhook endpoint with URL `https://<your-vercel-domain>/api/webhooks/stripe` and the same three events; set `STRIPE_WEBHOOK_SECRET` in Vercel to the new signing secret.
4. Ensure `NEXT_PUBLIC_APP_URL` is set to your production URL (e.g. `https://your-app.vercel.app`) so Stripe success/cancel redirects work.

## E2E testing checklist

- [ ] **Auth**: Sign up → confirm email (if enabled) → log in with Supabase Auth.
- [ ] **Checkout**: Log in → go to paywall or “Subscribe” → POST `/api/stripe/checkout` → redirect to Stripe Checkout → complete payment (use test card `4242 4242 4242 4242`).
- [ ] **Webhook**: After payment, Stripe sends `checkout.session.completed` → app updates `users.subscription_status` to `active` (check Supabase Table Editor or logs).
- [ ] **Chat access**: With active subscription, open `/chat` → send a message → receive streaming OpenAI response.
- [ ] **Paywall**: User without subscription visiting `/chat` is redirected to `/paywall`.
- [ ] **Subscription canceled**: In Stripe Dashboard (or CLI), cancel the subscription → `customer.subscription.deleted` → user’s status becomes `canceled` → next visit to `/chat` redirects to paywall.
- [ ] **Vercel**: Deploy and run the same flow with production env and production Stripe webhook.

## Project structure

- `app/` — App Router pages and API routes (`/api/chat`, `/api/stripe/checkout`, `/api/webhooks/stripe`, `/api/auth/logout`, `/auth/callback`, `/login`, `/signup`, `/paywall`, `/chat`, `/subscribe/success`, `/subscribe/cancel`).
- `lib/` — Env validation (`env.ts`), Supabase server/client/admin clients (`supabase/`), subscription helper (`subscription.ts`).
- `supabase/schema.sql` — SQL to run in Supabase for `users` table, RLS, and trigger.
- `middleware.ts` — Session refresh and protected-route redirects (webhook path is excluded).

## Scripts

- `npm run dev` — Start dev server.
- `npm run build` — Production build.
- `npm run start` — Start production server.
- `npm run lint` — Run ESLint (requires `eslint` and `eslint-config-next`; run `npm install` if needed).
