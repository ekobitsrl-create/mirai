# Configurazione email MIRAI

## 1. Variabili Vercel

Impostare in Production, Preview e Development:

- `RESEND_API_KEY`: API key del dominio verificato in Resend.
- `RESEND_FROM_EMAIL`: `MIRAI LAB STORE <customer@mirailabstore.com>`.
- `RESEND_REPLY_TO`: `info@mirailabstore.com`.
- `CRON_SECRET`: stringa casuale lunga almeno 32 caratteri.
- `EMAIL_UNSUBSCRIBE_SECRET`: stringa casuale diversa, lunga almeno 32 caratteri.
- `SUPABASE_SERVICE_ROLE_KEY`: chiave service role del progetto Supabase.

Non usare mai il prefisso `NEXT_PUBLIC_` per queste variabili.

## 2. Database Supabase

Eseguire `scripts/013_resend_email_automation.sql` nel SQL Editor. Le tabelle create non
hanno policy pubbliche e sono utilizzate solo dal server.

## 3. SMTP Supabase Auth

In Supabase aprire `Project Settings > Authentication > SMTP Settings` e attivare
Custom SMTP:

- Host: `smtp.resend.com`
- Porta: `465` (SSL) oppure `587` (STARTTLS)
- Username: `resend`
- Password: la stessa `RESEND_API_KEY`
- Sender email: `customer@mirailabstore.com`
- Sender name: `MIRAI LAB STORE`

In `Authentication > URL Configuration`:

- Site URL: `https://www.mirailabstore.com`
- Redirect URL: `https://www.mirailabstore.com/auth/confirm`
- Redirect URL: `https://www.mirailabstore.com/auth/update-password`

In `Authentication > Email Templates`, usare:

- Confirm signup: `emails/supabase/confirm-signup.html`
- Reset password: `emails/supabase/reset-password.html`

## 4. Eventi coperti

- Conferma registrazione e recupero password: Supabase Auth tramite SMTP Resend.
- Ordine Stripe/Klarna pagato: webhook Stripe.
- Ordine in contrassegno ricevuto: server action del checkout.
- Pagamento asincrono o PaymentIntent fallito: webhook Stripe.
- Stato ordine cambiato: pannello admin.
- Carrello abbandonato: Vercel Cron una volta al giorno, solo con consenso e disiscrizione.

La pianificazione giornaliera e compatibile anche con il piano Vercel Hobby. Su un piano
Pro puo essere aumentata, ad esempio ogni 6 ore, modificando `vercel.json`.

Il webhook Stripe deve includere:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
