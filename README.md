# Modestyinyou

Responsive Next.js storefront starter for an India-focused modest-fashion shop. The current catalogue is development-only: names, prices, stock, descriptions, and local illustrations are examples, not verified product facts. Checkout is a browser-only demonstration and does not place a real order or take payment.

## Stack and implementation status

- Next.js App Router, React, strict TypeScript, Tailwind CSS, Zod-ready integration boundary.
- Responsive storefront, collection/search/sort pages, product details and variants, persistent local cart, checkout form, and informational pages.
- Supabase Auth customer registration, email verification, login/logout, password reset, cookie-backed sessions, and protected `/account` pages are implemented. Google login is optionally shown when enabled and configured in Supabase.
- Customer profiles, addresses, wishlist records, order ownership, payment visibility, cancellation requests, payment webhook idempotency, and RLS are defined in the account migration.
- The catalogue and cart still use explicitly identified in-code development records. This is not a live product catalogue or production checkout.
- Admin authentication and order management still use legacy scaffolding and need a separate production security review before exposure.
- Demo SVG artwork is original local placeholder art. Replace it with owned/licensed imagery and verified product photos, alt text and product data.

## Prerequisites and local development

Use Node.js 20+ and pnpm.

```sh
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. With no Supabase credentials, storefront pages can use the local development catalogue, but authentication and customer accounts are unavailable. The sample environment enables the demo COD order route for local testing only. It writes order snapshots to Supabase when configured; it does not collect payment, confirm payment, or provide production fulfilment.

## Supabase setup

1. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` using the project URL and publishable key from Supabase. Set `SUPABASE_SECRET_KEY` using a newly generated secret key; keep it server-only and never use a `NEXT_PUBLIC_` prefix. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` names remain supported for existing deployments.
2. In the Supabase Dashboard, open **SQL Editor** and run each migration in timestamp order: `202610100001_initial_schema.sql`, `202610100002_order_management.sql`, `202610180001_customer_accounts.sql`, then `202610200001_hijab_categories.sql`. The customer-account migration adds customer-owned records, checkout idempotency, atomic order writes, payment webhook event handling, and customer/admin RLS policies. It removes old permissive order/payment write policies; review policy changes against any local customizations before applying. The latest migration adds the accessory parent-child taxonomy. This workspace has no Supabase CLI or database connection configured, so migrations must be applied from the dashboard or a trusted CLI session.
3. In Supabase Auth, configure the site URL and allow callback URLs for local and deployed `/auth/callback` routes. Enable email verification and password recovery. Use SMTP configuration suitable for production.
4. To enable Google sign-in, configure Google OAuth in Supabase and set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`; leave it false otherwise.
5. `supabase/seed.sql` creates development categories/products. Replace these examples before selling. Product variants and verified catalogue data are not connected to the storefront yet.
6. Configure private Storage and appropriate policies before storing customer or catalogue images. Never grant customers access to other users' records.

## Administrator provisioning

There are no hardcoded administrator credentials. Create an Auth user through a trusted process, then promote its `profiles.role` to `admin` using a database operator account. Public signup always creates a `customer` profile; role changes are not permitted through customer profile updates. The admin screens still need a separate security review and must not be exposed publicly as-is.

## Payments and shipping

Payment initiation and payment collection are not integrated. Checkout accepts COD only and is controlled by `DEMO_CHECKOUT_ENABLED`; keep it false in production until the live catalogue, server-side price/stock validation, policy checks, and a verified provider checkout adapter are implemented. The payment webhook route verifies Razorpay HMAC signatures, event IDs, amount/order association, and idempotently records captured, failed, and refund events, but there is no payment initiation path and no provider credentials are supplied. It cannot be used alone to collect payments.

Shipping currently uses a development flat fee of â‚¹79 in `src/lib/commerce.ts`. Replace it with documented server-side shipping rules, taxes and threshold configuration; checkout must recalculate all amounts from database data in integer paise.

## Environment variables

See `.env.example`. `NEXT_PUBLIC_*` values are public browser configuration. `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`), `PAYMENT_PROVIDER_KEY_SECRET` and `PAYMENT_WEBHOOK_SECRET` must remain server-only secrets. Configure Supabase Auth callback allowlists for the canonical deployed origin.

## Images and catalogue

Local original SVG illustrations are in `public/images`. They are layout placeholders and do not represent real textile properties. Replace with owned or appropriately licensed product photography. Add verified color, material, dimensions, care and stock information before publishing listings. The in-code catalogue can be retired after server-side Supabase queries are connected.

## Verification and deployment

```sh
pnpm lint
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

Unit tests cover commerce calculations, account input/redirect validation, and webhook HMAC verification. Supabase integration tests for RLS, Auth flows, and database webhook replay handling require a configured test project and are not run by the local unit suite. Deploy to a supported Next.js host, set environment variables, apply migrations, configure Auth redirects/SMTP, replace demo content, and complete the outstanding admin/payment security review. This starter is not ready to accept production orders.
