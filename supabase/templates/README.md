# Email MIRΛI PASS

Configurazione da applicare nel progetto Supabase `xbendkxwuaqrxsyrmgye`. Il push del repository su Vercel **non aggiorna** le impostazioni o i template ospitati da Supabase.

## URL

- Site URL: `https://www.mirailabstore.com`
- Redirect URL consentita: `https://www.mirailabstore.com/auth/confirm`
- Redirect locale facoltativa: `http://localhost:3000/auth/confirm`

Il Site URL non deve restare su `localhost`: Supabase lo usa anche quando un link non è valido o è scaduto. Verificare la configurazione pubblicata con `node scripts/check-auth-redirect.mjs`.

## Conferma registrazione

- Oggetto: `Attiva il tuo MIRΛI PASS`
- Template: copiare il contenuto di `confirmation.html` dentro **Authentication > Email Templates > Confirm signup**.

## Recupero password

- Oggetto: `Reimposta la password del tuo MIRΛI PASS`
- Il sito usa `POST /api/auth/reset-password`: genera il token con la chiave server Supabase e invia l'email italiana tramite Resend.
- Il link punta direttamente a `https://www.mirailabstore.com/auth/confirm?token_hash=...&type=recovery`; non dipende dal Site URL o dal template ospitato di Supabase.
- La pagina verifica il token come `recovery`, crea la sessione e inoltra a `/auth/update-password`.
- Copiare `../../emails/supabase/reset-password.html` in **Authentication > Email Templates > Reset password** e salvare. Anche gli invii diretti da Supabase devono usare il link MIRΛI con `{{ .TokenHash }}` e `type=recovery`, anziché `{{ .ConfirmationURL }}`: in questo modo aprono la pagina corretta senza dipendere dal redirect predefinito.
- Variabili server richieste: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` e `EMAIL_FROM` (oppure `RESEND_FROM_EMAIL`).

Dopo aver salvato URL e template, richiedere una **nuova** email da `https://www.mirailabstore.com/auth/forgot-password`. Le email già inviate non vengono riscritte. Il pulsante deve aprire `/auth/confirm`, quindi `/auth/update-password`; un link scaduto deve offrire una nuova richiesta di recupero.

## Mittente

Configurare un provider SMTP in **Authentication > Emails > SMTP Settings**.

- Sender name: `MIRΛI LAB STORE`
- Sender email consigliata: `mirailabstore@gmail.com`

Le credenziali SMTP non devono essere salvate nel repository.
