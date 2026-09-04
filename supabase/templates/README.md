# Email MIRΛI PASS

Configurazione da applicare nel progetto Supabase prima del lancio pubblico.

## URL

- Site URL: `https://www.mirailabstore.com`
- Redirect URL consentita: `https://www.mirailabstore.com/auth/confirm`
- Redirect locale facoltativa: `http://localhost:3000/auth/confirm`

## Conferma registrazione

- Oggetto: `Attiva il tuo MIRΛI PASS`
- Template: copiare il contenuto di `confirmation.html` dentro **Authentication > Email Templates > Confirm signup**.

## Recupero password

- Oggetto: `Reimposta la password del tuo MIRΛI PASS`
- Il sito usa `POST /api/auth/reset-password`: genera il token con la chiave server Supabase e invia l'email italiana tramite Resend.
- Il link punta direttamente a `https://www.mirailabstore.com/auth/confirm?token_hash=...&type=recovery`; non dipende dal Site URL o dal template ospitato di Supabase.
- La pagina verifica il token come `recovery`, crea la sessione e inoltra a `/auth/update-password`.
- `../../emails/supabase/reset-password.html` resta come riferimento grafico o fallback per eventuali invii avviati direttamente da Supabase.
- Variabili server richieste: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` e `EMAIL_FROM` (oppure `RESEND_FROM_EMAIL`).

## Mittente

Configurare un provider SMTP in **Authentication > Emails > SMTP Settings**.

- Sender name: `MIRΛI LAB STORE`
- Sender email consigliata: `mirailabstore@gmail.com`

Le credenziali SMTP non devono essere salvate nel repository.
