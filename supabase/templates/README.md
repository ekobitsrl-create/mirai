# Email MIRAI PASS

Configurazione da applicare nel progetto Supabase prima del lancio pubblico.

## URL

- Site URL: `https://www.mirailabstore.com`
- Redirect URL consentita: `https://www.mirailabstore.com/auth/confirm`
- Redirect locale facoltativa: `http://localhost:3000/auth/confirm`

## Conferma registrazione

- Oggetto: `Attiva il tuo MIRAI PASS`
- Template: copiare il contenuto di `confirmation.html` dentro **Authentication > Email Templates > Confirm signup**.

## Mittente

Configurare un provider SMTP in **Authentication > Emails > SMTP Settings**.

- Sender name: `MIRAI LAB STORE`
- Sender email consigliata: `community@mirailabstore.com` oppure `noreply@mirailabstore.com`

Le credenziali SMTP non devono essere salvate nel repository.
