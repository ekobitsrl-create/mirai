# Feed multilingua Google Merchant

Ogni URL è vincolato a una sola lingua e a un'etichetta origine dati univoca.
L'etichetta va impostata durante la creazione dell'origine dati in Merchant
Center: non è un attributo letto dal file XML e non può essere cambiata dopo la
creazione dell'origine.

| Origine | URL | Lingua | Etichetta origine dati | Paesi di destinazione |
| --- | --- | --- | --- | --- |
| Italia (esistente, non modificare) | `https://www.mirailabstore.com/google-merchant-feed.xml` | Italiano | `IT` | Italia |
| Spagna | `https://www.mirailabstore.com/google-merchant-feed-es.xml` | Spagnolo | `EU_ES` | Spagna |
| Germania e Austria | `https://www.mirailabstore.com/google-merchant-feed-de.xml` | Tedesco | `EU_DE` | Germania, Austria |
| Francia, Belgio e Lussemburgo | `https://www.mirailabstore.com/google-merchant-feed-fr.xml` | Francese | `EU_FR` | Francia, Belgio, Lussemburgo |
| Altri Paesi UE | `https://www.mirailabstore.com/google-merchant-feed-en.xml` | Inglese | `EU_EN` | Bulgaria, Croazia, Cipro, Cechia, Danimarca, Estonia, Finlandia, Grecia, Ungheria, Irlanda, Lettonia, Lituania, Malta, Paesi Bassi, Polonia, Portogallo, Romania, Slovacchia, Slovenia, Svezia |

## Regole operative

1. Non modificare, eliminare o ricreare l'origine italiana: deve continuare a
   usare URL, lingua ed etichetta `IT` attuali.
2. Eliminare o disattivare solo le vecchie origini estere create con etichetta
   `IT`, quindi ricrearle usando la riga corrispondente della tabella.
3. Per le origini estere selezionare **Schede gratuite** come metodo di
   marketing. Il feed esclude già Shopping Ads e Display Ads, così il traffico
   a pagamento italiano non viene ampliato involontariamente.
4. Non usare lo stesso Paese in più origini linguistiche. Gli ID offerta possono
   restare invariati: Google identifica ogni offerta tramite la combinazione di
   lingua, etichetta origine dati e ID.
5. Dopo il primo recupero controllare che lingua, etichetta e Paesi mostrati in
   Merchant Center coincidano con la tabella prima di attivare le origini.

Gli endpoint espongono inoltre gli header diagnostici
`X-Mirai-Merchant-Content-Language`, `X-Mirai-Merchant-Feed-Label` e
`X-Mirai-Merchant-Target-Countries`. Servono per la verifica tecnica; Merchant
Center usa comunque i valori configurati nell'origine dati.
