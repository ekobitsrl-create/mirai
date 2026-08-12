import type { Locale } from "./translations"

export const localeTags: Record<Locale, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
}

export function formatLocalizedPrice(value: number, locale: Locale, currency = "EUR") {
  return new Intl.NumberFormat(localeTags[locale], {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(value))
}

type PhraseRow = readonly [it: string, en: string, es: string, de: string, fr: string]

const phraseRows: PhraseRow[] = [
  ["OTTIENI IL 10% DI SCONTO SUL PRIMO ORDINE", "GET 10% OFF YOUR FIRST ORDER", "CONSIGUE UN 10% DE DESCUENTO EN TU PRIMER PEDIDO", "10 % RABATT AUF DEINE ERSTE BESTELLUNG", "OBTENEZ 10 % DE RÉDUCTION SUR VOTRE PREMIÈRE COMMANDE"],
  ["Abbigliamento che guarda al futuro. Design innovativo, materiali tecnici, stile senza compromessi.", "Future-facing clothing. Innovative design, technical materials and uncompromising style.", "Ropa que mira al futuro. Diseño innovador, materiales técnicos y estilo sin concesiones.", "Mode mit Blick in die Zukunft. Innovatives Design, technische Materialien und kompromissloser Stil.", "Des vêtements tournés vers l’avenir. Design innovant, matières techniques et style sans compromis."],
  ["DATI AZIENDALI", "COMPANY DETAILS", "DATOS DE LA EMPRESA", "UNTERNEHMENSDATEN", "INFORMATIONS SUR L’ENTREPRISE"],
  ["INDIRIZZO NEGOZIO", "STORE ADDRESS", "DIRECCIÓN DE LA TIENDA", "GESCHÄFTSADRESSE", "ADRESSE DE LA BOUTIQUE"],
  ["Gestisci cookie", "Manage cookies", "Gestionar cookies", "Cookies verwalten", "Gérer les cookies"],
  ["Ultimo aggiornamento: 2 agosto 2026", "Last updated: 2 August 2026", "Última actualización: 2 de agosto de 2026", "Zuletzt aktualisiert: 2. August 2026", "Dernière mise à jour : 2 août 2026"],
  ["1. Venditore", "1. Seller", "1. Vendedor", "1. Verkäufer", "1. Vendeur"],
  ["2. Prodotti, prezzi e disponibilita", "2. Products, prices and availability", "2. Productos, precios y disponibilidad", "2. Produkte, Preise und Verfügbarkeit", "2. Produits, prix et disponibilité"],
  ["3. Ordini e pagamenti", "3. Orders and payments", "3. Pedidos y pagos", "3. Bestellungen und Zahlungen", "3. Commandes et paiements"],
  ["4. Spedizioni", "4. Shipping", "4. Envíos", "4. Versand", "4. Livraisons"],
  ["5. Resi, recesso e rimborsi", "5. Returns, withdrawal and refunds", "5. Devoluciones, desistimiento y reembolsos", "5. Rückgabe, Widerruf und Erstattung", "5. Retours, rétractation et remboursements"],
  ["6. Garanzia legale", "6. Legal guarantee", "6. Garantía legal", "6. Gesetzliche Gewährleistung", "6. Garantie légale"],
  ["7. Prodotti personalizzati", "7. Custom products", "7. Productos personalizados", "7. Personalisierte Produkte", "7. Produits personnalisés"],
  ["8. Privacy e cookie", "8. Privacy and cookies", "8. Privacidad y cookies", "8. Datenschutz und Cookies", "8. Confidentialité et cookies"],
  ["9. Legge applicabile e foro", "9. Governing law and jurisdiction", "9. Ley aplicable y jurisdicción", "9. Anwendbares Recht und Gerichtsstand", "9. Droit applicable et juridiction"],
  ["10. Contatti", "10. Contact", "10. Contacto", "10. Kontakt", "10. Contact"],
  ["1. Titolare del Trattamento", "1. Data Controller", "1. Responsable del tratamiento", "1. Verantwortlicher", "1. Responsable du traitement"],
  ["2. Dati Raccolti", "2. Data Collected", "2. Datos recopilados", "2. Erhobene Daten", "2. Données collectées"],
  ["3. Finalita del Trattamento", "3. Purposes of Processing", "3. Finalidades del tratamiento", "3. Zwecke der Verarbeitung", "3. Finalités du traitement"],
  ["4. Base Giuridica", "4. Legal Basis", "4. Base jurídica", "4. Rechtsgrundlage", "4. Base juridique"],
  ["5. Conservazione dei Dati", "5. Data Retention", "5. Conservación de datos", "5. Datenspeicherung", "5. Conservation des données"],
  ["6. Condivisione con Terze Parti", "6. Sharing with Third Parties", "6. Compartición con terceros", "6. Weitergabe an Dritte", "6. Partage avec des tiers"],
  ["7. I Tuoi Diritti", "7. Your Rights", "7. Tus derechos", "7. Deine Rechte", "7. Vos droits"],
  ["8. Cookie", "8. Cookies", "8. Cookies", "8. Cookies", "8. Cookies"],
  ["Cosa Sono i Cookie", "What Cookies Are", "Qué son las cookies", "Was Cookies sind", "Que sont les cookies"],
  ["Cookie Utilizzati", "Cookies We Use", "Cookies utilizadas", "Verwendete Cookies", "Cookies utilisés"],
  ["Cookie di Terze Parti", "Third-party Cookies", "Cookies de terceros", "Cookies von Drittanbietern", "Cookies tiers"],
  ["Gestione dei Cookie", "Cookie Management", "Gestión de cookies", "Cookie-Verwaltung", "Gestion des cookies"],
  ["Aggiornamenti", "Updates", "Actualizaciones", "Aktualisierungen", "Mises à jour"],
  ["Tipo", "Type", "Tipo", "Typ", "Type"],
  ["Finalita", "Purpose", "Finalidad", "Zweck", "Finalité"],
  ["Durata", "Duration", "Duración", "Dauer", "Durée"],
  ["Tecnici (necessari)", "Technical (necessary)", "Técnicas (necesarias)", "Technisch (notwendig)", "Techniques (nécessaires)"],
  ["Autenticazione", "Authentication", "Autenticación", "Authentifizierung", "Authentification"],
  ["Preferenze", "Preferences", "Preferencias", "Präferenzen", "Préférences"],
  ["Analitici", "Analytics", "Analíticas", "Analyse", "Analytiques"],
  ["Quali metodi di pagamento accettate?", "Which payment methods do you accept?", "¿Qué métodos de pago aceptáis?", "Welche Zahlungsmethoden akzeptiert ihr?", "Quels moyens de paiement acceptez-vous ?"],
  ["Posso modificare o annullare un ordine?", "Can I change or cancel an order?", "¿Puedo modificar o cancelar un pedido?", "Kann ich eine Bestellung ändern oder stornieren?", "Puis-je modifier ou annuler une commande ?"],
  ["Ricevero una conferma dell'ordine?", "Will I receive an order confirmation?", "¿Recibiré una confirmación del pedido?", "Erhalte ich eine Bestellbestätigung?", "Vais-je recevoir une confirmation de commande ?"],
  ["Quanto costa la spedizione?", "How much does shipping cost?", "¿Cuánto cuesta el envío?", "Wie viel kostet der Versand?", "Combien coûte la livraison ?"],
  ["In quanto tempo ricevero il mio ordine?", "How long will my order take to arrive?", "¿Cuánto tardará en llegar mi pedido?", "Wann erhalte ich meine Bestellung?", "Sous quel délai vais-je recevoir ma commande ?"],
  ["Spedite all'estero?", "Do you ship internationally?", "¿Hacéis envíos al extranjero?", "Versendet ihr ins Ausland?", "Livrez-vous à l’étranger ?"],
  ["Posso restituire un prodotto?", "Can I return a product?", "¿Puedo devolver un producto?", "Kann ich ein Produkt zurückgeben?", "Puis-je retourner un produit ?"],
  ["Il reso e gratuito?", "Is the return free?", "¿La devolución es gratuita?", "Ist die Rückgabe kostenlos?", "Le retour est-il gratuit ?"],
  ["Come devo spedire il reso?", "How do I send a return?", "¿Cómo envío la devolución?", "Wie sende ich eine Rückgabe?", "Comment expédier mon retour ?"],
  ["Quanto tempo ci vuole per il rimborso?", "How long does a refund take?", "¿Cuánto tarda el reembolso?", "Wie lange dauert die Erstattung?", "Quel est le délai de remboursement ?"],
  ["Come scelgo la taglia giusta?", "How do I choose the right size?", "¿Cómo elijo la talla adecuada?", "Wie wähle ich die richtige Größe?", "Comment choisir la bonne taille ?"],
  ["I colori dei prodotti sono fedeli alle foto?", "Are product colours true to the photos?", "¿Los colores de los productos son fieles a las fotos?", "Entsprechen die Produktfarben den Fotos?", "Les couleurs des produits correspondent-elles aux photos ?"],
  ["Posso personalizzare un capo?", "Can I customise a garment?", "¿Puedo personalizar una prenda?", "Kann ich ein Kleidungsstück personalisieren?", "Puis-je personnaliser un vêtement ?"],
  ["Trova le risposte alle domande piu comuni. Se non trovi quello che cerchi, puoi contattarci.", "Find answers to the most common questions. If you can’t find what you need, contact us.", "Encuentra respuestas a las preguntas más frecuentes. Si no encuentras lo que buscas, contáctanos.", "Hier findest du Antworten auf häufige Fragen. Wenn du nicht findest, was du suchst, kontaktiere uns.", "Retrouvez les réponses aux questions les plus fréquentes. Si vous ne trouvez pas ce que vous cherchez, contactez-nous."],
  ["Il nostro team e pronto ad aiutarti per qualsiasi dubbio o necessita.", "Our team is ready to help with any question or need.", "Nuestro equipo está listo para ayudarte con cualquier duda o necesidad.", "Unser Team hilft dir bei allen Fragen und Anliegen.", "Notre équipe est prête à vous aider pour toute question ou besoin."],
  ["Compila il form qui sotto e ti risponderemo il prima possibile. Per ordini esistenti, includi il numero d'ordine nel messaggio.", "Complete the form below and we’ll reply as soon as possible. For existing orders, include your order number in the message.", "Completa el formulario y te responderemos lo antes posible. Para pedidos existentes, incluye el número de pedido en el mensaje.", "Fülle das Formular aus und wir antworten so schnell wie möglich. Gib bei bestehenden Bestellungen die Bestellnummer an.", "Remplissez le formulaire ci-dessous et nous vous répondrons rapidement. Pour une commande existante, indiquez son numéro dans le message."],
  ["Trova le risposte alle domande piu comuni. Se non trovi quello che cerchi, puoi", "Find answers to the most common questions. If you can’t find what you need,", "Encuentra respuestas a las preguntas más frecuentes. Si no encuentras lo que buscas,", "Hier findest du Antworten auf häufige Fragen. Wenn du nicht findest, was du suchst,", "Retrouvez les réponses aux questions les plus fréquentes. Si vous ne trouvez pas ce que vous cherchez,"],
  ["Le presenti condizioni regolano gli acquisti su", "These terms govern purchases made on", "Estas condiciones regulan las compras realizadas en", "Diese Bedingungen regeln Käufe auf", "Les présentes conditions régissent les achats effectués sur"],
  [", gestito da", ", operated by", ", gestionado por", ", betrieben von", ", exploité par"],
  [", con sede operativa in", ", with operating address at", ", con sede operativa en", ", mit Betriebsanschrift in", ", dont l’adresse d’exploitation est"],
  ["La spedizione è gratuita senza importo minimo. Costi, tempi, origine degli ordini, tracking e destinazioni sono indicati nella pagina", "Shipping is free with no minimum spend. Costs, delivery times, order origin, tracking and destinations are detailed on the", "El envío es gratuito sin compra mínima. Los costes, plazos, origen de los pedidos, seguimiento y destinos se indican en la página", "Der Versand ist ohne Mindestbestellwert kostenlos. Kosten, Lieferzeiten, Bestellherkunft, Sendungsverfolgung und Ziele findest du auf der Seite", "La livraison est gratuite sans minimum d’achat. Les coûts, délais, origine des commandes, suivi et destinations sont indiqués sur la page"],
  [". L'eventuale supplemento fisso di 9 € per il contrassegno riguarda il metodo di pagamento e non costituisce un costo di spedizione. Le informazioni mostrate al checkout prevalgono se aggiornate in tempo reale prima della conferma.", ". Any fixed €9 cash-on-delivery surcharge concerns the payment method and is not a shipping cost. Information shown at checkout prevails when updated in real time before confirmation.", ". El posible suplemento fijo de 9 € por pago contra reembolso corresponde al método de pago y no es un coste de envío. Prevalece la información mostrada en el checkout y actualizada antes de la confirmación.", ". Ein möglicher fester Nachnahmezuschlag von 9 € betrifft die Zahlungsart und ist keine Versandgebühr. Maßgeblich sind die vor der Bestätigung in Echtzeit angezeigten Checkout-Angaben.", ". L’éventuel supplément fixe de 9 € pour le paiement à la livraison concerne le mode de paiement et non les frais d’expédition. Les informations actualisées au checkout avant confirmation prévalent."],
  ["Il trattamento dei dati personali e descritto nella", "The processing of personal data is described in the", "El tratamiento de los datos personales se describe en la", "Die Verarbeitung personenbezogener Daten ist beschrieben in der", "Le traitement des données personnelles est décrit dans la"],
  [". L'uso dei cookie e descritto nella", ". The use of cookies is described in the", ". El uso de cookies se describe en la", ". Die Verwendung von Cookies ist beschrieben in der", ". L’utilisation des cookies est décrite dans la"],
  ["Per informazioni sui cookie utilizzati, consulta la nostra", "For information about the cookies we use, see our", "Para información sobre las cookies utilizadas, consulta nuestra", "Informationen zu den verwendeten Cookies findest du in unserer", "Pour en savoir plus sur les cookies utilisés, consultez notre"],
  ["Per comunicazioni formali o reclami puoi scrivere a", "For formal notices or complaints, write to", "Para comunicaciones formales o reclamaciones, escribe a", "Für formelle Mitteilungen oder Beschwerden schreibe an", "Pour toute communication formelle ou réclamation, écrivez à"],
  [". Per assistenza ordinaria puoi usare la pagina", ". For standard support, use the", ". Para asistencia habitual, utiliza la página", ". Für allgemeinen Support nutze die Seite", ". Pour une assistance courante, utilisez la page"],
  ["o scrivere a", "or write to", "o escribe a", "oder schreibe an", "ou écrivez à"],
  ["Per gli ordini consegnati in Italia, il cliente consumatore può richiedere il reso entro 14 giorni di calendario dalla consegna, salvo esclusioni previste dalla legge e per prodotti personalizzati, se non difettosi o non conformi. Il reso avviene per posta, consegnando il pacco al corriere o al punto indicato nell'etichetta prepagata fornita da MIRAI. Le spese di restituzione sono interamente a carico di MIRAI, il costo per il cliente è 0,00 EUR e non viene applicato alcun costo di restocking. Metodo, condizioni e tempi di rimborso sono indicati nella pagina separata", "For orders delivered in Italy, consumers may request a return within 14 calendar days of delivery, except where the law excludes this right and for customised products that are not defective or non-compliant. Returns are sent by post by handing the parcel to the carrier or drop-off point shown on MIRAI’s prepaid label. MIRAI pays the full return cost, the customer pays EUR 0.00 and no restocking fee applies. The method, conditions and refund times are detailed on the separate", "Para pedidos entregados en Italia, el consumidor puede solicitar una devolución en los 14 días naturales posteriores a la entrega, salvo las exclusiones legales y los productos personalizados que no sean defectuosos o no conformes. La devolución se realiza por correo, entregando el paquete al transportista o al punto indicado en la etiqueta prepagada de MIRAI. MIRAI asume íntegramente los gastos, el coste para el cliente es de 0,00 EUR y no se aplica ninguna tasa de reposición. El método, las condiciones y los plazos de reembolso se indican en la página", "Bei in Italien zugestellten Bestellungen können Verbraucher innerhalb von 14 Kalendertagen nach Lieferung eine Rückgabe beantragen, ausgenommen gesetzlich ausgeschlossene Fälle und personalisierte Produkte ohne Mangel oder Abweichung. Die Rücksendung erfolgt per Post über den Versanddienstleister oder die auf dem vorausbezahlten MIRAI-Etikett angegebene Abgabestelle. MIRAI trägt die gesamten Rücksendekosten, für Kunden fallen 0,00 EUR und keine Wiedereinlagerungsgebühr an. Methode, Bedingungen und Erstattungsfristen stehen auf der separaten Seite", "Pour les commandes livrées en Italie, le consommateur peut demander un retour dans les 14 jours calendaires suivant la livraison, sauf exclusions légales et produits personnalisés ni défectueux ni non conformes. Le retour s’effectue par voie postale, auprès du transporteur ou du point indiqué sur l’étiquette prépayée MIRAI. MIRAI prend en charge tous les frais, le coût client est de 0,00 EUR et aucuns frais de restockage ne s’appliquent. La méthode, les conditions et les délais de remboursement figurent sur la page"],
  ["I prodotti sono descritti nelle rispettive pagine con prezzo in Euro, IVA inclusa ove applicabile, immagini, taglie e disponibilita. MIRAI puo aggiornare prezzi e disponibilita prima della conferma dell'ordine. Le immagini possono variare leggermente per impostazioni dello schermo o produzione artigianale.", "Products are described on their respective pages with prices in euros, VAT included where applicable, images, sizes and availability. MIRAI may update prices and availability before order confirmation. Images may vary slightly due to screen settings or artisanal production.", "Los productos se describen en sus páginas con precio en euros, IVA incluido cuando corresponda, imágenes, tallas y disponibilidad. MIRAI puede actualizar precios y disponibilidad antes de confirmar el pedido. Las imágenes pueden variar ligeramente por los ajustes de pantalla o la producción artesanal.", "Die Produkte werden auf den jeweiligen Seiten mit Preisen in Euro, gegebenenfalls inklusive Mehrwertsteuer, Bildern, Größen und Verfügbarkeit beschrieben. MIRAI kann Preise und Verfügbarkeit vor der Bestellbestätigung aktualisieren. Bilder können je nach Bildschirmeinstellung oder handwerklicher Fertigung leicht abweichen.", "Les produits sont décrits sur leurs pages respectives avec leur prix en euros, TVA comprise le cas échéant, leurs images, tailles et disponibilités. MIRAI peut actualiser les prix et les stocks avant confirmation. Les images peuvent légèrement varier selon l’écran ou la fabrication artisanale."],
  ["L'ordine inviato dal cliente costituisce proposta di acquisto. Il contratto si conclude con la conferma dell'ordine. I pagamenti online sono gestiti tramite Stripe e possono includere carte, PayPal, Apple Pay, Google Pay, Klarna o Scalapay quando disponibili per l'ordine. Per le consegne in Italia puo essere disponibile il pagamento in contrassegno, con un supplemento fisso di 9 € mostrato nel riepilogo prima della conferma. Il checkout avviene su connessione sicura.", "An order submitted by the customer is an offer to purchase. The contract is concluded upon order confirmation. Online payments are handled through Stripe and may include cards, PayPal, Apple Pay, Google Pay, Klarna or Scalapay when available. Cash on delivery may be available in Italy with a fixed €9 surcharge shown before confirmation. Checkout uses a secure connection.", "El pedido enviado por el cliente constituye una propuesta de compra. El contrato se formaliza con la confirmación. Los pagos online se procesan mediante Stripe y pueden incluir tarjetas, PayPal, Apple Pay, Google Pay, Klarna o Scalapay cuando estén disponibles. En Italia puede ofrecerse el pago contra reembolso con un suplemento fijo de 9 € mostrado antes de confirmar. El checkout utiliza una conexión segura.", "Die vom Kunden übermittelte Bestellung gilt als Kaufangebot. Der Vertrag kommt mit der Bestellbestätigung zustande. Online-Zahlungen werden über Stripe abgewickelt und können Karten, PayPal, Apple Pay, Google Pay, Klarna oder Scalapay umfassen. In Italien kann Nachnahme mit einem vor der Bestätigung angezeigten festen Zuschlag von 9 € verfügbar sein. Der Checkout ist sicher verschlüsselt.", "La commande transmise par le client constitue une offre d’achat. Le contrat est conclu lors de sa confirmation. Les paiements en ligne sont gérés via Stripe et peuvent inclure cartes, PayPal, Apple Pay, Google Pay, Klarna ou Scalapay selon disponibilité. Le paiement à la livraison peut être proposé en Italie avec un supplément fixe de 9 € affiché avant confirmation. Le checkout est sécurisé."],
  ["I prodotti venduti a consumatori sono coperti dalla garanzia legale di conformita prevista dal Codice del Consumo. In caso di difetto o non conformita, contatta MIRAI con numero ordine, descrizione del problema e foto del prodotto.", "Products sold to consumers are covered by the statutory conformity guarantee. If a product is defective or non-compliant, contact MIRAI with the order number, a description and photos.", "Los productos vendidos a consumidores están cubiertos por la garantía legal de conformidad. En caso de defecto o falta de conformidad, contacta con MIRAI indicando el número de pedido, una descripción y fotos.", "An Verbraucher verkaufte Produkte unterliegen der gesetzlichen Konformitätsgarantie. Bei Mängeln oder Abweichungen kontaktiere MIRAI mit Bestellnummer, Problembeschreibung und Fotos.", "Les produits vendus aux consommateurs bénéficient de la garantie légale de conformité. En cas de défaut ou de non-conformité, contactez MIRAI avec le numéro de commande, une description et des photos."],
  ["I capi custom o personalizzati sono realizzati su richiesta del cliente. Non possono essere restituiti per semplice ripensamento, salvo difetto, errore imputabile a MIRAI o non conformita rispetto all'ordine confermato.", "Custom or personalised garments are made to the customer’s specifications. They cannot be returned for a change of mind unless defective, incorrect due to MIRAI or non-compliant with the confirmed order.", "Las prendas custom o personalizadas se realizan por encargo. No pueden devolverse por cambio de opinión, salvo defecto, error imputable a MIRAI o falta de conformidad con el pedido confirmado.", "Custom- oder personalisierte Artikel werden nach Kundenwunsch gefertigt. Eine Rückgabe wegen Meinungsänderung ist ausgeschlossen, außer bei Mängeln, einem MIRAI zurechenbaren Fehler oder Abweichung von der bestätigten Bestellung.", "Les articles custom ou personnalisés sont réalisés à la demande. Ils ne peuvent être retournés pour simple changement d’avis, sauf défaut, erreur imputable à MIRAI ou non-conformité à la commande confirmée."],
  ["Le presenti condizioni sono regolate dalla legge italiana. Per i consumatori resta competente il foro del luogo di residenza o domicilio del consumatore, se previsto dalla normativa applicabile. Negli altri casi sara competente il Foro di Catania.", "These terms are governed by Italian law. Where applicable, consumers retain the jurisdiction of their place of residence or domicile. In all other cases, the courts of Catania have jurisdiction.", "Estas condiciones se rigen por la legislación italiana. Cuando proceda, el consumidor conserva la jurisdicción de su lugar de residencia o domicilio. En los demás casos serán competentes los tribunales de Catania.", "Diese Bedingungen unterliegen italienischem Recht. Soweit anwendbar, bleibt für Verbraucher der Gerichtsstand ihres Wohnsitzes maßgeblich. In allen anderen Fällen sind die Gerichte von Catania zuständig.", "Les présentes conditions sont régies par le droit italien. Lorsque la réglementation le prévoit, le consommateur conserve la juridiction de son lieu de résidence ou domicile. Dans les autres cas, les tribunaux de Catane sont compétents."],
  ["Raccogliamo i seguenti dati personali:", "We collect the following personal data:", "Recopilamos los siguientes datos personales:", "Wir erheben folgende personenbezogene Daten:", "Nous collectons les données personnelles suivantes :"],
  ["I tuoi dati vengono trattati per le seguenti finalita:", "Your data is processed for the following purposes:", "Tus datos se tratan para las siguientes finalidades:", "Deine Daten werden für folgende Zwecke verarbeitet:", "Vos données sont traitées aux fins suivantes :"],
  ["Dati identificativi: nome, cognome, indirizzo email", "Identity data: first name, last name and email address", "Datos identificativos: nombre, apellidos y correo electrónico", "Identitätsdaten: Vorname, Nachname und E-Mail-Adresse", "Données d’identification : prénom, nom et adresse e-mail"],
  ["Dati di contatto: indirizzo di spedizione, numero di telefono", "Contact data: shipping address and phone number", "Datos de contacto: dirección de envío y teléfono", "Kontaktdaten: Lieferadresse und Telefonnummer", "Coordonnées : adresse de livraison et numéro de téléphone"],
  ["Dati di pagamento: elaborati tramite Stripe (non conserviamo dati delle carte)", "Payment data: processed by Stripe (we do not store card details)", "Datos de pago: tratados por Stripe (no almacenamos datos de tarjetas)", "Zahlungsdaten: Verarbeitung durch Stripe (wir speichern keine Kartendaten)", "Données de paiement : traitées par Stripe (nous ne conservons pas les données de carte)"],
  ["Dati di navigazione: indirizzo IP, tipo di browser, pagine visitate, cookie tecnici", "Browsing data: IP address, browser type, visited pages and technical cookies", "Datos de navegación: dirección IP, navegador, páginas visitadas y cookies técnicas", "Nutzungsdaten: IP-Adresse, Browsertyp, besuchte Seiten und technische Cookies", "Données de navigation : adresse IP, navigateur, pages visitées et cookies techniques"],
  ["Dati dell'account: credenziali di accesso (password criptata)", "Account data: sign-in credentials (encrypted password)", "Datos de la cuenta: credenciales de acceso (contraseña cifrada)", "Kontodaten: Zugangsdaten (verschlüsseltes Passwort)", "Données du compte : identifiants de connexion (mot de passe chiffré)"],
  ["Dati del carrello: articoli, quantita e preferenze, usati per i promemoria solo con consenso", "Cart data: items, quantities and preferences, used for reminders only with consent", "Datos del carrito: artículos, cantidades y preferencias, usados para recordatorios solo con consentimiento", "Warenkorbdaten: Artikel, Mengen und Präferenzen, nur mit Einwilligung für Erinnerungen genutzt", "Données du panier : articles, quantités et préférences, utilisées pour les rappels uniquement avec consentement"],
  ["Evasione degli ordini e gestione delle spedizioni", "Order fulfilment and shipping management", "Preparación de pedidos y gestión de envíos", "Bestellabwicklung und Versand", "Traitement des commandes et gestion des expéditions"],
  ["Gestione dell'account utente e recupero password", "User account management and password recovery", "Gestión de la cuenta y recuperación de contraseña", "Kontoverwaltung und Passwortwiederherstellung", "Gestion du compte et récupération du mot de passe"],
  ["Comunicazioni relative agli ordini (conferme, pagamenti, stato e assistenza)", "Order-related communications (confirmations, payments, status and support)", "Comunicaciones del pedido (confirmaciones, pagos, estado y asistencia)", "Bestellbezogene Mitteilungen (Bestätigungen, Zahlungen, Status und Support)", "Communications relatives aux commandes (confirmations, paiements, suivi et assistance)"],
  ["Promemoria del carrello e comunicazioni commerciali (solo con consenso esplicito)", "Cart reminders and marketing communications (only with explicit consent)", "Recordatorios del carrito y comunicaciones comerciales (solo con consentimiento explícito)", "Warenkorberinnerungen und Marketingmitteilungen (nur mit ausdrücklicher Einwilligung)", "Rappels de panier et communications commerciales (uniquement avec consentement explicite)"],
  ["Adempimento di obblighi legali e fiscali", "Compliance with legal and tax obligations", "Cumplimiento de obligaciones legales y fiscales", "Erfüllung gesetzlicher und steuerlicher Pflichten", "Respect des obligations légales et fiscales"],
  ["Miglioramento del servizio e analisi statistiche anonimizzate", "Service improvement and anonymised statistical analysis", "Mejora del servicio y análisis estadísticos anonimizados", "Serviceverbesserung und anonymisierte statistische Analysen", "Amélioration du service et analyses statistiques anonymisées"],
  ["Accedere ai tuoi dati personali", "Access your personal data", "Acceder a tus datos personales", "Auf deine personenbezogenen Daten zugreifen", "Accéder à vos données personnelles"],
  ["Rettificare dati inesatti o incompleti", "Correct inaccurate or incomplete data", "Rectificar datos inexactos o incompletos", "Unrichtige oder unvollständige Daten berichtigen", "Rectifier des données inexactes ou incomplètes"],
  ["Cancellare i tuoi dati (diritto all'oblio)", "Delete your data (right to erasure)", "Suprimir tus datos (derecho al olvido)", "Deine Daten löschen (Recht auf Löschung)", "Effacer vos données (droit à l’oubli)"],
  ["Limitare il trattamento", "Restrict processing", "Limitar el tratamiento", "Die Verarbeitung einschränken", "Limiter le traitement"],
  ["Portare i tuoi dati (portabilita)", "Receive or transfer your data (portability)", "Recibir o transferir tus datos (portabilidad)", "Deine Daten übertragen (Datenübertragbarkeit)", "Recevoir ou transférer vos données (portabilité)"],
  ["Opporti al trattamento", "Object to processing", "Oponerte al tratamiento", "Der Verarbeitung widersprechen", "Vous opposer au traitement"],
  ["Revocare il consenso in qualsiasi momento", "Withdraw consent at any time", "Retirar el consentimiento en cualquier momento", "Die Einwilligung jederzeit widerrufen", "Retirer votre consentement à tout moment"],
  ["I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. Servono a migliorare la tua esperienza di navigazione, ricordare le tue preferenze e analizzare il traffico del sito.", "Cookies are small text files stored on your device when you visit a website. They improve browsing, remember your preferences and help analyse site traffic.", "Las cookies son pequeños archivos de texto que se guardan en tu dispositivo al visitar un sitio web. Mejoran la navegación, recuerdan tus preferencias y ayudan a analizar el tráfico.", "Cookies sind kleine Textdateien, die beim Besuch einer Website auf deinem Gerät gespeichert werden. Sie verbessern die Nutzung, merken sich Präferenzen und helfen bei der Analyse des Datenverkehrs.", "Les cookies sont de petits fichiers texte enregistrés sur votre appareil lorsque vous consultez un site. Ils améliorent la navigation, mémorisent vos préférences et permettent d’analyser le trafic."],
  ["Il nostro sito potrebbe utilizzare servizi di terze parti che installano propri cookie:", "Our site may use third-party services that set their own cookies:", "Nuestro sitio puede utilizar servicios de terceros que instalan sus propias cookies:", "Unsere Website kann Dienste Dritter nutzen, die eigene Cookies setzen:", "Notre site peut utiliser des services tiers qui déposent leurs propres cookies :"],
  ["Di seguito le guide per i principali browser:", "Guides for the main browsers:", "Guías para los principales navegadores:", "Anleitungen für die wichtigsten Browser:", "Guides pour les principaux navigateurs :"],
  ["Sessione / 1 anno", "Session / 1 year", "Sesión / 1 año", "Sitzung / 1 Jahr", "Session / 1 an"],
  ["30 giorni", "30 days", "30 días", "30 Tage", "30 jours"],
  ["1 anno", "1 year", "1 año", "1 Jahr", "1 an"],
  ["Secondo le impostazioni dei fornitori", "According to provider settings", "Según la configuración de los proveedores", "Gemäß den Einstellungen der Anbieter", "Selon les paramètres des fournisseurs"],
  ["Torna alla Home", "Back to Home", "Volver al inicio", "Zur Startseite", "Retour à l’accueil"],
  ["Riepilogo dei prodotti selezionati e accesso al checkout.", "Summary of selected products and access to checkout.", "Resumen de los productos seleccionados y acceso al checkout.", "Übersicht der ausgewählten Produkte und Zugang zur Kasse.", "Récapitulatif des produits sélectionnés et accès au paiement."],
  ["Rimuovi dai preferiti", "Remove from wishlist", "Quitar de favoritos", "Von der Wunschliste entfernen", "Retirer des favoris"],
  ["Aggiungi ai preferiti", "Add to wishlist", "Añadir a favoritos", "Zur Wunschliste hinzufügen", "Ajouter aux favoris"],
  ["Ingrandisci immagine prodotto", "Enlarge product image", "Ampliar imagen del producto", "Produktbild vergrößern", "Agrandir l’image du produit"],
  ["Condividi prodotto", "Share product", "Compartir producto", "Produkt teilen", "Partager le produit"],
  ["Chiudi filtri", "Close filters", "Cerrar filtros", "Filter schließen", "Fermer les filtres"],
  ["Chiudi quick add", "Close quick add", "Cerrar añadido rápido", "Schnellansicht schließen", "Fermer l’ajout rapide"],
  ["Chiudi", "Close", "Cerrar", "Schließen", "Fermer"],
  ["Digital membership", "Digital membership", "Membresía digital", "Digitale Mitgliedschaft", "Adhésion numérique"],
  ["Member", "Member", "Miembro", "Mitglied", "Membre"],
  ["Anteprime", "Previews", "Avances", "Previews", "Avant-premières"],
  ["Capi, collaborazioni e custom piece prima della pubblicazione.", "Garments, collaborations and custom pieces before release.", "Prendas, colaboraciones y piezas custom antes del lanzamiento.", "Kleidungsstücke, Kooperationen und Custom Pieces vor der Veröffentlichung.", "Pièces, collaborations et créations custom avant leur sortie."],
  ["Puntate, ospiti e note audio disponibili in anticipo per i membri.", "Episodes, guests and audio notes available early for members.", "Episodios, invitados y notas de audio disponibles antes para los miembros.", "Folgen, Gäste und Audionotizen vorab für Mitglieder.", "Épisodes, invités et notes audio disponibles en avant-première pour les membres."],
  ["Uno spazio per parlare di outfit, musica, idee e cultura urbana.", "A space to talk about outfits, music, ideas and urban culture.", "Un espacio para hablar de looks, música, ideas y cultura urbana.", "Ein Raum für Outfits, Musik, Ideen und urbane Kultur.", "Un espace pour parler de looks, de musique, d’idées et de culture urbaine."],
  ["News & eventi", "News & events", "Noticias y eventos", "News & Events", "Actualités et événements"],
  ["Aperture, eventi, listening session e comunicazioni riservate.", "Openings, events, listening sessions and member-only updates.", "Aperturas, eventos, sesiones de escucha y comunicaciones reservadas.", "Eröffnungen, Events, Listening Sessions und exklusive Mitteilungen.", "Ouvertures, événements, sessions d’écoute et communications réservées."],
  ["Il tuo account apre il Society Hub e i suoi canali. Il pass digitale resta separato e verrà collegato alle future esperienze NFC.", "Your account unlocks the Society Hub and its channels. The digital pass remains separate and will be linked to future NFC experiences.", "Tu cuenta abre el Society Hub y sus canales. El pase digital sigue separado y se vinculará a futuras experiencias NFC.", "Dein Konto öffnet den Society Hub und seine Kanäle. Der digitale Pass bleibt separat und wird mit zukünftigen NFC-Erlebnissen verknüpft.", "Votre compte ouvre le Society Hub et ses canaux. Le pass numérique reste distinct et sera lié aux futures expériences NFC."],
  ["Non solo prodotti: uno spazio riservato a chi vuole vedere prima, ascoltare prima e partecipare alla costruzione di MIRAI.", "More than products: a space for those who want to see first, listen first and help shape MIRAI.", "Más que productos: un espacio para quienes quieren ver antes, escuchar antes y participar en la construcción de MIRAI.", "Mehr als Produkte: ein Raum für alle, die früher sehen, früher hören und MIRAI mitgestalten möchten.", "Plus que des produits : un espace pour celles et ceux qui veulent voir avant, écouter avant et participer à la construction de MIRAI."],
  ["Canali", "Channels", "Canales", "Kanäle", "Canaux"],
  ["Tutte le Collezioni", "All Collections", "Todas las colecciones", "Alle Kollektionen", "Toutes les collections"],
  ["Scopri la Collezione", "Discover the Collection", "Descubre la colección", "Kollektion entdecken", "Découvrir la collection"],
  ["Resta Aggiornato", "Stay Updated", "Mantente al día", "Bleib auf dem Laufenden", "Restez informé"],
  ["Spedizioni", "Shipping", "Envíos", "Versand", "Livraison"],
  ["Resi e Rimborsi", "Returns and Refunds", "Devoluciones y reembolsos", "Rückgabe und Erstattung", "Retours et remboursements"],
  ["Contatti", "Contact", "Contacto", "Kontakt", "Contact"],
  ["Chi Siamo", "About Us", "Quiénes somos", "Über uns", "À propos"],
  ["Termini e Condizioni", "Terms and Conditions", "Términos y condiciones", "Allgemeine Geschäftsbedingungen", "Conditions générales"],
  ["Privacy Policy", "Privacy Policy", "Política de privacidad", "Datenschutzerklärung", "Politique de confidentialité"],
  ["Cookie Policy", "Cookie Policy", "Política de cookies", "Cookie-Richtlinie", "Politique relative aux cookies"],
  ["Domande Frequenti", "Frequently Asked Questions", "Preguntas frecuentes", "Häufig gestellte Fragen", "Questions fréquentes"],
  ["Non hai trovato la risposta?", "Couldn’t find the answer?", "¿No has encontrado la respuesta?", "Keine Antwort gefunden?", "Vous n’avez pas trouvé la réponse ?"],
  ["Contattaci", "Contact us", "Contáctanos", "Kontaktiere uns", "Contactez-nous"],
  ["Nome", "Name", "Nombre", "Name", "Nom"],
  ["Messaggio", "Message", "Mensaje", "Nachricht", "Message"],
  ["Invia Messaggio", "Send Message", "Enviar mensaje", "Nachricht senden", "Envoyer le message"],
  ["Il tuo nome", "Your name", "Tu nombre", "Dein Name", "Votre nom"],
  ["Come possiamo aiutarti?", "How can we help?", "¿Cómo podemos ayudarte?", "Wie können wir helfen?", "Comment pouvons-nous vous aider ?"],
  ["Scrivici un Messaggio", "Send us a Message", "Escríbenos", "Schreib uns", "Écrivez-nous"],
  ["Rispondiamo entro 24 ore lavorative", "We reply within 24 business hours", "Respondemos en 24 horas laborables", "Wir antworten innerhalb von 24 Arbeitsstunden", "Nous répondons sous 24 heures ouvrées"],
  ["Orari Supporto", "Support Hours", "Horario de atención", "Supportzeiten", "Horaires du support"],
  ["Lun - Ven", "Mon - Fri", "Lun - Vie", "Mo - Fr", "Lun - Ven"],
  ["Indirizzo", "Address", "Dirección", "Adresse", "Adresse"],
  ["Preparazione e consegna", "Preparation and delivery", "Preparación y entrega", "Vorbereitung und Lieferung", "Préparation et livraison"],
  ["Tracciamento ordine", "Order tracking", "Seguimiento del pedido", "Bestellverfolgung", "Suivi de commande"],
  ["Indirizzi e mancata consegna", "Addresses and failed delivery", "Direcciones y entrega fallida", "Adressen und fehlgeschlagene Zustellung", "Adresses et échec de livraison"],
  ["Imballaggio", "Packaging", "Embalaje", "Verpackung", "Emballage"],
  ["Tempi e costi chiari", "Clear times and costs", "Plazos y costes claros", "Klare Zeiten und Kosten", "Délais et coûts transparents"],
  ["Spedizione", "Shipping", "Envío", "Versand", "Livraison"],
  ["Sempre gratuita", "Always free", "Siempre gratis", "Immer kostenlos", "Toujours gratuite"],
  ["Nessun importo minimo richiesto", "No minimum spend required", "Sin compra mínima", "Kein Mindestbestellwert", "Aucun minimum de commande"],
  ["Prodotti standard", "Standard products", "Productos estándar", "Standardprodukte", "Produits standards"],
  ["Prodotti a consegna estesa", "Extended-delivery products", "Productos con entrega ampliada", "Produkte mit längerer Lieferzeit", "Produits à délai prolongé"],
  ["Destinazioni", "Destinations", "Destinos", "Lieferziele", "Destinations"],
  ["Italia e UE", "Italy and EU", "Italia y UE", "Italien und EU", "Italie et UE"],
  ["3–5 giorni lavorativi", "3–5 business days", "3–5 días laborables", "3–5 Werktage", "3–5 jours ouvrés"],
  ["7–12 giorni lavorativi", "7–12 business days", "7–12 días laborables", "7–12 Werktage", "7–12 jours ouvrés"],
  ["Pagamento in contrassegno", "Cash on delivery", "Pago contra reembolso", "Nachnahme", "Paiement à la livraison"],
  ["Politica di reso MIRAI", "MIRAI return policy", "Política de devoluciones MIRAI", "MIRAI-Rückgaberichtlinie", "Politique de retour MIRAI"],
  ["14 giorni", "14 days", "14 días", "14 Tage", "14 jours"],
  ["Spese a carico MIRAI", "Return shipping paid by MIRAI", "Gastos a cargo de MIRAI", "Rücksendekosten durch MIRAI", "Frais pris en charge par MIRAI"],
  ["Rimborso entro 14 giorni", "Refund within 14 days", "Reembolso en 14 días", "Erstattung innerhalb von 14 Tagen", "Remboursement sous 14 jours"],
  ["Riepilogo della politica di reso", "Return policy summary", "Resumen de la política de devoluciones", "Zusammenfassung der Rückgaberichtlinie", "Résumé de la politique de retour"],
  ["Paese", "Country", "País", "Land", "Pays"],
  ["Valuta", "Currency", "Moneda", "Währung", "Devise"],
  ["Finestra di reso", "Return window", "Plazo de devolución", "Rückgabefrist", "Délai de retour"],
  ["Metodo", "Method", "Método", "Methode", "Méthode"],
  ["Costo del reso", "Return cost", "Coste de devolución", "Rücksendekosten", "Coût du retour"],
  ["Costo di restocking", "Restocking fee", "Coste de reposición", "Wiedereinlagerungsgebühr", "Frais de restockage"],
  ["Come effettuare un reso", "How to make a return", "Cómo realizar una devolución", "So funktioniert die Rückgabe", "Comment effectuer un retour"],
  ["Resi accettati", "Accepted returns", "Devoluciones aceptadas", "Akzeptierte Rückgaben", "Retours acceptés"],
  ["Resi non accettati", "Returns not accepted", "Devoluciones no aceptadas", "Nicht akzeptierte Rückgaben", "Retours non acceptés"],
  ["Costi di restituzione", "Return shipping costs", "Gastos de devolución", "Rücksendekosten", "Frais de retour"],
  ["Rimborsi", "Refunds", "Reembolsos", "Erstattungen", "Remboursements"],
  ["Contatto resi", "Returns contact", "Contacto para devoluciones", "Kontakt für Rückgaben", "Contact retours"],
  ["Ultimo aggiornamento: 9 agosto 2026.", "Last updated: 9 August 2026.", "Última actualización: 9 de agosto de 2026.", "Zuletzt aktualisiert: 9. August 2026.", "Dernière mise à jour : 9 août 2026."],
  ["Ordini e Pagamenti", "Orders and Payments", "Pedidos y pagos", "Bestellungen und Zahlungen", "Commandes et paiements"],
  ["Resi e Rimborsi", "Returns and Refunds", "Devoluciones y reembolsos", "Rückgabe und Erstattung", "Retours et remboursements"],
  ["Prodotti e Taglie", "Products and Sizes", "Productos y tallas", "Produkte und Größen", "Produits et tailles"],
  ["Account e Community", "Account and Community", "Cuenta y comunidad", "Konto und Community", "Compte et communauté"],
  ["Il tuo account", "Your account", "Tu cuenta", "Dein Konto", "Votre compte"],
  ["Esci", "Sign out", "Cerrar sesión", "Abmelden", "Se déconnecter"],
  ["I tuoi ordini", "Your orders", "Tus pedidos", "Deine Bestellungen", "Vos commandes"],
  ["Nessun ordine", "No orders", "Sin pedidos", "Keine Bestellungen", "Aucune commande"],
  ["In attesa", "Pending", "Pendiente", "Ausstehend", "En attente"],
  ["Confermato", "Confirmed", "Confirmado", "Bestätigt", "Confirmé"],
  ["In lavorazione", "Processing", "En preparación", "In Bearbeitung", "En préparation"],
  ["Spedito", "Shipped", "Enviado", "Versandt", "Expédié"],
  ["Consegnato", "Delivered", "Entregado", "Zugestellt", "Livré"],
  ["Annullato", "Cancelled", "Cancelado", "Storniert", "Annulé"],
  ["Pagamento in verifica", "Payment being verified", "Pago en verificación", "Zahlung wird geprüft", "Paiement en cours de vérification"],
  ["Aggiorna stato", "Refresh status", "Actualizar estado", "Status aktualisieren", "Actualiser le statut"],
  ["Ordine ricevuto", "Order received", "Pedido recibido", "Bestellung eingegangen", "Commande reçue"],
  ["I miei ordini", "My orders", "Mis pedidos", "Meine Bestellungen", "Mes commandes"],
  ["Torna allo shop", "Back to shop", "Volver a la tienda", "Zurück zum Shop", "Retour à la boutique"],
  ["Pagamento completato", "Payment completed", "Pago completado", "Zahlung abgeschlossen", "Paiement effectué"],
  ["Pagamento annullato", "Payment cancelled", "Pago cancelado", "Zahlung abgebrochen", "Paiement annulé"],
  ["Riprova", "Try again", "Intentar de nuevo", "Erneut versuchen", "Réessayer"],
  ["Prodotto aggiunto al carrello", "Product added to cart", "Producto añadido al carrito", "Produkt zum Warenkorb hinzugefügt", "Produit ajouté au panier"],
  ["Chiudi notifica", "Close notification", "Cerrar notificación", "Benachrichtigung schließen", "Fermer la notification"],
  ["Vai al checkout", "Go to checkout", "Ir al checkout", "Zur Kasse", "Passer au paiement"],
  ["Benvenuto in MIRAI", "Welcome to MIRAI", "Bienvenido a MIRAI", "Willkommen bei MIRAI", "Bienvenue chez MIRAI"],
  ["Il tuo primo ordine", "Your first order", "Tu primer pedido", "Deine erste Bestellung", "Votre première commande"],
  ["10% di sconto", "10% off", "10% de descuento", "10% Rabatt", "10% de réduction"],
  ["Copiato", "Copied", "Copiado", "Kopiert", "Copié"],
  ["Copia", "Copy", "Copiar", "Kopieren", "Copier"],
  ["Continua qui", "Keep browsing", "Seguir aquí", "Hier weitermachen", "Continuer ici"],
  ["Scopri lo shop", "Discover the shop", "Descubre la tienda", "Shop entdecken", "Découvrir la boutique"],
  ["Valido una volta, esclusivamente sul primo ordine", "Valid once, on your first order only", "Válido una vez, solo en el primer pedido", "Einmalig und nur für die erste Bestellung gültig", "Valable une fois, uniquement sur la première commande"],
  ["I Nostri Beat", "Our Beats", "Nuestros Beats", "Unsere Beats", "Nos Beats"],
  ["Traccia precedente", "Previous track", "Pista anterior", "Vorheriger Track", "Piste précédente"],
  ["Traccia successiva", "Next track", "Pista siguiente", "Nächster Track", "Piste suivante"],
  ["In rotazione", "Now spinning", "En reproducción", "Läuft gerade", "En lecture"],
  ["Premi play", "Press play", "Pulsa play", "Play drücken", "Appuyez sur lecture"],
  ["Avanzamento traccia", "Track progress", "Progreso de la pista", "Track-Fortschritt", "Progression de la piste"],
  ["La tua guida", "Your guide", "Tu guía", "Dein Guide", "Votre guide"],
  ["Scegli la tua MIRA", "Choose your MIRA", "Elige tu MIRA", "Wähle deine MIRA", "Choisissez votre MIRA"],
  ["Femminile", "Female", "Femenina", "Weiblich", "Féminine"],
  ["Maschile", "Male", "Masculino", "Männlich", "Masculine"],
  ["Mostra MIRA", "Show MIRA", "Mostrar MIRA", "MIRA anzeigen", "Afficher MIRA"],
  ["Riapri MIRA", "Reopen MIRA", "Volver a abrir MIRA", "MIRA wieder öffnen", "Rouvrir MIRA"],
  ["Parla con MIRA", "Talk to MIRA", "Hablar con MIRA", "Mit MIRA sprechen", "Parler à MIRA"],
  ["Suggerimento di MIRA", "MIRA suggestion", "Sugerencia de MIRA", "MIRA-Vorschlag", "Suggestion de MIRA"],
  ["Ti ascolto", "I’m listening", "Te escucho", "Ich höre zu", "Je vous écoute"],
  ["Ci sto pensando", "I’m thinking", "Estoy pensando", "Ich denke nach", "Je réfléchis"],
  ["Ti rispondo", "I’m replying", "Te respondo", "Ich antworte", "Je vous réponds"],
  ["Guida MIRAI", "MIRAI guide", "Guía MIRAI", "MIRAI-Guide", "Guide MIRAI"],
  ["Chiedi qualcosa a MIRA…", "Ask MIRA something…", "Pregunta algo a MIRA…", "Frag MIRA etwas…", "Demandez quelque chose à MIRA…"],
  ["Invia richiesta a MIRA", "Send request to MIRA", "Enviar solicitud a MIRA", "Anfrage an MIRA senden", "Envoyer la demande à MIRA"],
  ["Sposta MIRA", "Move MIRA", "Mover MIRA", "MIRA verschieben", "Déplacer MIRA"],
  ["Tocca per chiedere", "Tap to ask", "Toca para preguntar", "Tippen zum Fragen", "Touchez pour demander"],
  ["Novità", "New", "Nuevo", "Neu", "Nouveau"],
  ["Primo ordine", "First order", "Primer pedido", "Erste Bestellung", "Première commande"],
  ["Colore", "Colour", "Color", "Farbe", "Couleur"],
  ["Varianti colore", "Colour variants", "Variantes de color", "Farbvarianten", "Variantes de couleur"],
  ["Taglia", "Size", "Talla", "Größe", "Taille"],
  ["Guida alle taglie", "Size guide", "Guía de tallas", "Größentabelle", "Guide des tailles"],
  ["Aggiunto", "Added", "Añadido", "Hinzugefügt", "Ajouté"],
  ["Aggiungi al carrello", "Add to cart", "Añadir al carrito", "In den Warenkorb", "Ajouter au panier"],
  ["Esaurito", "Sold out", "Agotado", "Ausverkauft", "Épuisé"],
  ["Spedizione gratuita", "Free shipping", "Envío gratuito", "Kostenloser Versand", "Livraison gratuite"],
  ["Sempre", "Always", "Siempre", "Immer", "Toujours"],
  ["Reso facile", "Easy return", "Devolución fácil", "Einfache Rückgabe", "Retour facile"],
  ["Entro 14 giorni", "Within 14 days", "En 14 días", "Innerhalb von 14 Tagen", "Sous 14 jours"],
  ["Dettagli prodotto", "Product details", "Detalles del producto", "Produktdetails", "Détails du produit"],
  ["Composizione e cura", "Composition and care", "Composición y cuidado", "Material und Pflege", "Composition et entretien"],
  ["Scegli taglia", "Choose size", "Elegir talla", "Größe wählen", "Choisir la taille"],
  ["Torace", "Chest", "Pecho", "Brust", "Poitrine"],
  ["Lunghezza", "Length", "Largo", "Länge", "Longueur"],
  ["Manica", "Sleeve", "Manga", "Ärmel", "Manche"],
  ["Acquisto come ospite", "Guest checkout", "Compra como invitado", "Als Gast bestellen", "Achat en tant qu’invité"],
  ["Continua come ospite", "Continue as guest", "Continuar como invitado", "Als Gast fortfahren", "Continuer en tant qu’invité"],
  ["Acquisto come ospite senza email", "Guest checkout without email", "Compra como invitado sin email", "Gastbestellung ohne E-Mail", "Achat invité sans e-mail"],
  ["Hai un codice sconto?", "Have a discount code?", "¿Tienes un código de descuento?", "Hast du einen Rabattcode?", "Vous avez un code promo ?"],
  ["Rimuovi", "Remove", "Eliminar", "Entfernen", "Supprimer"],
  ["Codice sconto", "Discount code", "Código de descuento", "Rabattcode", "Code promo"],
  ["Inserisci il codice", "Enter the code", "Introduce el código", "Code eingeben", "Saisissez le code"],
  ["Applica", "Apply", "Aplicar", "Anwenden", "Appliquer"],
  ["Metodo di pagamento", "Payment method", "Método de pago", "Zahlungsart", "Mode de paiement"],
  ["Pagamento online", "Online payment", "Pago online", "Online-Zahlung", "Paiement en ligne"],
  ["Pagamento sicuro", "Secure payment", "Pago seguro", "Sichere Zahlung", "Paiement sécurisé"],
  ["Pagamento online non disponibile", "Online payment unavailable", "Pago online no disponible", "Online-Zahlung nicht verfügbar", "Paiement en ligne indisponible"],
  ["Preparazione pagamento sicuro...", "Preparing secure payment...", "Preparando el pago seguro...", "Sichere Zahlung wird vorbereitet...", "Préparation du paiement sécurisé..."],
  ["Impossibile caricare il pagamento", "Unable to load payment", "No se puede cargar el pago", "Zahlung konnte nicht geladen werden", "Impossible de charger le paiement"],
  ["Pagamento alla consegna", "Payment on delivery", "Pago a la entrega", "Zahlung bei Lieferung", "Paiement à la livraison"],
  ["Nome e cognome", "Full name", "Nombre y apellidos", "Vor- und Nachname", "Nom et prénom"],
  ["Numero di telefono", "Phone number", "Número de teléfono", "Telefonnummer", "Numéro de téléphone"],
  ["Conferma ordine in contrassegno", "Confirm cash-on-delivery order", "Confirmar pedido contra reembolso", "Nachnahmebestellung bestätigen", "Confirmer la commande à la livraison"],
  ["Invio ordine...", "Sending order...", "Enviando pedido...", "Bestellung wird gesendet...", "Envoi de la commande..."],
  ["MIRAI fit guide", "MIRAI fit guide", "Guía de tallas MIRAI", "MIRAI Fit-Guide", "Guide de coupe MIRAI"],
  ["Accedi", "Sign in", "Iniciar sesión", "Anmelden", "Se connecter"],
  ["Accesso in corso...", "Signing in...", "Iniciando sesión...", "Anmeldung läuft...", "Connexion..."],
  ["Password dimenticata?", "Forgot password?", "¿Olvidaste la contraseña?", "Passwort vergessen?", "Mot de passe oublié ?"],
  ["Registrati", "Sign up", "Registrarse", "Registrieren", "S’inscrire"],
  ["Non hai un account?", "Don’t have an account?", "¿No tienes una cuenta?", "Noch kein Konto?", "Vous n’avez pas de compte ?"],
  ["Crea account", "Create account", "Crear cuenta", "Konto erstellen", "Créer un compte"],
  ["Registrazione in corso...", "Creating account...", "Creando cuenta...", "Konto wird erstellt...", "Création du compte..."],
  ["Conferma la tua email", "Confirm your email", "Confirma tu email", "E-Mail bestätigen", "Confirmez votre e-mail"],
  ["Recupera password", "Reset password", "Restablecer contraseña", "Passwort zurücksetzen", "Réinitialiser le mot de passe"],
  ["Invia link", "Send link", "Enviar enlace", "Link senden", "Envoyer le lien"],
  ["La pagina non si è caricata correttamente", "The page didn’t load correctly", "La página no se ha cargado correctamente", "Die Seite wurde nicht richtig geladen", "La page ne s’est pas chargée correctement"],
  ["Il carrello è stato conservato. Riprova oppure torna allo shop.", "Your cart has been saved. Try again or return to the shop.", "Tu carrito se ha guardado. Inténtalo de nuevo o vuelve a la tienda.", "Dein Warenkorb wurde gespeichert. Versuche es erneut oder gehe zurück zum Shop.", "Votre panier a été conservé. Réessayez ou retournez à la boutique."],
  ["Codice assistenza", "Support code", "Código de asistencia", "Supportcode", "Code d’assistance"],
  ["Hai domande, suggerimenti o vuoi collaborare con noi? Siamo sempre disponibili ad ascoltarti.", "Questions, suggestions or interested in working with us? We’re always happy to hear from you.", "¿Tienes preguntas, sugerencias o quieres colaborar con nosotros? Siempre estamos disponibles para escucharte.", "Fragen, Anregungen oder Interesse an einer Zusammenarbeit? Wir hören gerne von dir.", "Des questions, des suggestions ou envie de collaborer avec nous ? Nous sommes à votre écoute."],
  ["Il nostro MIRAI LAB STORE aprirà presto", "Our MIRAI LAB STORE is opening soon", "Nuestro MIRAI LAB STORE abrirá pronto", "Unser MIRAI LAB STORE eröffnet bald", "Notre MIRAI LAB STORE ouvrira bientôt"],
  ["Compila il form qui sotto e ti risponderemo il prima possibile. Per ordini esistenti, includi il numero d'ordine nel messaggio.", "Fill in the form below and we’ll reply as soon as possible. For existing orders, include the order number in your message.", "Completa el formulario y te responderemos lo antes posible. Para pedidos existentes, incluye el número de pedido.", "Fülle das Formular aus und wir antworten so schnell wie möglich. Gib bei bestehenden Bestellungen die Bestellnummer an.", "Remplissez le formulaire et nous vous répondrons rapidement. Pour une commande existante, indiquez son numéro."],
  ["La spedizione è sempre gratuita, senza importo minimo. Se scegli il pagamento in contrassegno viene applicato un supplemento fisso di 9 €, distinto dal costo di spedizione. I tempi di consegna variano in base al prodotto e sono indicati chiaramente nella relativa scheda.", "Shipping is always free, with no minimum spend. Cash on delivery carries a fixed €9 surcharge, separate from shipping. Delivery times vary by product and are clearly shown on its page.", "El envío siempre es gratuito, sin compra mínima. El pago contra reembolso tiene un suplemento fijo de 9 €, independiente del envío. Los plazos varían según el producto y se indican claramente en su página.", "Der Versand ist immer kostenlos, ohne Mindestbestellwert. Für Nachnahme fällt ein fester Zuschlag von 9 € an. Die Lieferzeit variiert je nach Produkt und steht auf der Produktseite.", "La livraison est toujours gratuite, sans minimum d’achat. Le paiement à la livraison entraîne un supplément fixe de 9 €, distinct des frais de livraison. Les délais varient selon le produit et sont indiqués sur sa fiche."],
  ["La tempistica è indicata nella scheda prodotto", "Timing is shown on the product page", "El plazo se indica en la página del producto", "Die Lieferzeit steht auf der Produktseite", "Le délai est indiqué sur la fiche produit"],
  ["Spedizione gratuita in Italia e in Europa", "Free shipping in Italy and Europe", "Envío gratuito en Italia y Europa", "Kostenloser Versand in Italien und Europa", "Livraison gratuite en Italie et en Europe"],
  ["Questa politica si applica agli ordini MIRAI consegnati in Italia e riassume tempi, metodo di reso, costi e modalità di rimborso.", "This policy applies to MIRAI orders delivered in Italy and summarises timing, return method, costs and refunds.", "Esta política se aplica a los pedidos MIRAI entregados en Italia y resume plazos, método, costes y reembolsos.", "Diese Richtlinie gilt für in Italien zugestellte MIRAI-Bestellungen und fasst Fristen, Rückgabe, Kosten und Erstattung zusammen.", "Cette politique s’applique aux commandes MIRAI livrées en Italie et résume délais, méthode, coûts et remboursement."],
  ["Puoi richiedere il reso dalla data di consegna.", "You can request a return from the delivery date.", "Puedes solicitar la devolución desde la fecha de entrega.", "Du kannst die Rückgabe ab dem Lieferdatum beantragen.", "Vous pouvez demander un retour à compter de la livraison."],
  ["Etichetta prepagata per ogni reso approvato.", "Prepaid label for every approved return.", "Etiqueta prepagada para cada devolución aprobada.", "Vorausbezahltes Etikett für jede genehmigte Rückgabe.", "Étiquette prépayée pour chaque retour approuvé."],
  ["Sullo stesso metodo di pagamento usato al checkout.", "To the same payment method used at checkout.", "Al mismo método de pago utilizado en el checkout.", "Auf dieselbe beim Checkout verwendete Zahlungsart.", "Sur le même moyen de paiement utilisé lors du paiement."],
  ["Tutti", "All", "Todos", "Alle", "Tous"],
  ["Disponibilità", "Availability", "Disponibilidad", "Verfügbarkeit", "Disponibilité"],
  ["Disponibili", "Available", "Disponibles", "Verfügbar", "Disponibles"],
  ["Esauriti", "Sold out", "Agotados", "Ausverkauft", "Épuisés"],
  ["Prezzo massimo", "Maximum price", "Precio máximo", "Höchstpreis", "Prix maximum"],
  ["Fino a", "Up to", "Hasta", "Bis", "Jusqu’à"],
  ["Azzera", "Reset", "Restablecer", "Zurücksetzen", "Réinitialiser"],
  ["Azzera tutto", "Clear all", "Borrar todo", "Alles löschen", "Tout effacer"],
  ["Mostra tutto", "Show all", "Mostrar todo", "Alle anzeigen", "Tout afficher"],
  ["Filtri", "Filters", "Filtros", "Filter", "Filtres"],
  ["Categoria", "Category", "Categoría", "Kategorie", "Catégorie"],
  ["Sottocategorie", "Subcategories", "Subcategorías", "Unterkategorien", "Sous-catégories"],
  ["Collezioni", "Collections", "Colecciones", "Kollektionen", "Collections"],
  ["Subtotale", "Subtotal", "Subtotal", "Zwischensumme", "Sous-total"],
  ["Prodotti", "Products", "Productos", "Produkte", "Produits"],
  ["Supplemento contrassegno", "Cash-on-delivery surcharge", "Suplemento contra reembolso", "Nachnahmezuschlag", "Supplément paiement à la livraison"],
  ["con", "with", "con", "mit", "avec"],
  ["Inserisci prima un indirizzo email valido.", "Enter a valid email address first.", "Introduce primero un email válido.", "Gib zuerst eine gültige E-Mail-Adresse ein.", "Saisissez d’abord une adresse e-mail valide."],
  ["L'indirizzo email inserito non è valido.", "The email address is not valid.", "La dirección de email no es válida.", "Die E-Mail-Adresse ist ungültig.", "L’adresse e-mail n’est pas valide."],
  ["Codice sconto non valido", "Invalid discount code", "Código de descuento no válido", "Ungültiger Rabattcode", "Code promo invalide"],
  ["Non è stato possibile registrare l'ordine", "The order could not be recorded", "No se ha podido registrar el pedido", "Die Bestellung konnte nicht gespeichert werden", "La commande n’a pas pu être enregistrée"],
  ["Email (facoltativa)", "Email (optional)", "Email (opcional)", "E-Mail (optional)", "E-mail (facultatif)"],
  ["Modifica", "Edit", "Modificar", "Ändern", "Modifier"],
  ["Ho gia un account", "I already have an account", "Ya tengo una cuenta", "Ich habe bereits ein Konto", "J’ai déjà un compte"],
  ["Contrassegno", "Cash on delivery", "Contra reembolso", "Nachnahme", "Paiement à la livraison"],
  ["Citta", "City", "Ciudad", "Stadt", "Ville"],
  ["CAP", "Postcode", "Código postal", "PLZ", "Code postal"],
  ["MIRAI10 ti dà il 10% sul primo ordine.", "MIRAI10 gives you 10% off your first order.", "MIRAI10 te da un 10% en tu primer pedido.", "Mit MIRAI10 erhältst du 10 % Rabatt auf deine erste Bestellung.", "MIRAI10 vous offre 10 % sur votre première commande."],
  ["Puoi continuare senza email. Se la inserisci, riceverai la conferma e gli aggiornamenti dell'ordine.", "You can continue without an email. If you enter one, you’ll receive confirmation and order updates.", "Puedes continuar sin email. Si lo introduces, recibirás la confirmación y las actualizaciones del pedido.", "Du kannst ohne E-Mail fortfahren. Wenn du eine angibst, erhältst du Bestätigung und Bestellupdates.", "Vous pouvez continuer sans e-mail. Si vous en saisissez un, vous recevrez la confirmation et les mises à jour de la commande."],
  ["Pagamento sicuro", "Secure payment", "Pago seguro", "Sichere Zahlung", "Paiement sécurisé"],
  ["I dati di pagamento vengono gestiti direttamente da Stripe e non passano da MIRAI.", "Payment details are handled directly by Stripe and never pass through MIRAI.", "Los datos de pago son gestionados directamente por Stripe y no pasan por MIRAI.", "Zahlungsdaten werden direkt von Stripe verarbeitet und nicht an MIRAI übermittelt.", "Les données de paiement sont gérées directement par Stripe et ne transitent pas par MIRAI."],
  ["Il contrassegno è disponibile esclusivamente per le consegne in Italia e prevede un supplemento fisso di 9 €. Il supplemento riguarda il metodo di pagamento, non la spedizione, che resta gratuita. L'importo viene mostrato e incluso nel totale del checkout prima della conferma dell'ordine.", "Cash on delivery is available only for deliveries in Italy and carries a fixed €9 surcharge. This surcharge applies to the payment method, not shipping, which remains free. It is shown and included in the checkout total before the order is confirmed.", "El pago contra reembolso solo está disponible para entregas en Italia y tiene un suplemento fijo de 9 €. Este suplemento corresponde al método de pago, no al envío, que sigue siendo gratuito. Se muestra e incluye en el total antes de confirmar el pedido.", "Nachnahme ist nur für Lieferungen innerhalb Italiens verfügbar und kostet einen festen Zuschlag von 9 €. Dieser betrifft die Zahlungsart, nicht den weiterhin kostenlosen Versand. Er wird vor Bestellbestätigung im Gesamtbetrag angezeigt.", "Le paiement à la livraison est disponible uniquement en Italie et entraîne un supplément fixe de 9 €. Celui-ci concerne le mode de paiement, pas la livraison qui reste gratuite. Il est affiché et inclus dans le total avant confirmation."],
  ["La consegna stimata è di 3–5 giorni lavorativi per i prodotti standard e di 7–12 giorni lavorativi per i prodotti che riportano questa indicazione nella scheda. La tempistica applicabile compare sempre nella pagina del prodotto e può variare in periodi di picco, festività o per cause non dipendenti da MIRAI.", "Estimated delivery is 3–5 business days for standard products and 7–12 business days for products marked accordingly. The applicable timing is always shown on the product page and may vary during peak periods, public holidays or for reasons beyond MIRAI’s control.", "La entrega estimada es de 3–5 días laborables para productos estándar y de 7–12 días para los productos que así lo indiquen. El plazo aparece siempre en la página del producto y puede variar en periodos de alta demanda, festivos o por causas ajenas a MIRAI.", "Die voraussichtliche Lieferung beträgt 3–5 Werktage für Standardprodukte und 7–12 Werktage für entsprechend gekennzeichnete Produkte. Die jeweilige Lieferzeit steht auf der Produktseite und kann sich zu Spitzenzeiten, an Feiertagen oder aus Gründen außerhalb des Einflusses von MIRAI ändern.", "La livraison estimée est de 3–5 jours ouvrés pour les produits standard et de 7–12 jours pour les produits signalés comme tels. Le délai applicable figure toujours sur la fiche produit et peut varier en période de forte activité, pendant les jours fériés ou pour des raisons indépendantes de MIRAI."],
  ["Dopo la spedizione riceverai un'email con il codice di tracciamento. Il tracking puo richiedere fino a 24 ore per aggiornarsi sul sito del corriere.", "Once your order ships, you’ll receive an email with the tracking code. Tracking may take up to 24 hours to update on the carrier’s website.", "Después del envío recibirás un email con el código de seguimiento. La información puede tardar hasta 24 horas en actualizarse en la web del transportista.", "Nach dem Versand erhältst du eine E-Mail mit der Sendungsnummer. Die Aktualisierung auf der Website des Versanddienstleisters kann bis zu 24 Stunden dauern.", "Après l’expédition, vous recevrez un e-mail avec le numéro de suivi. Le suivi peut mettre jusqu’à 24 heures à s’actualiser sur le site du transporteur."],
  ["Verifica sempre l'indirizzo prima del pagamento: eventuali costi per giacenza, riconsegna o rientro causati da dati errati possono essere addebitati al cliente.", "Always check the address before payment: storage, redelivery or return costs caused by incorrect details may be charged to the customer.", "Comprueba siempre la dirección antes del pago: los costes de almacenamiento, nueva entrega o devolución causados por datos incorrectos podrán cargarse al cliente.", "Prüfe die Adresse immer vor der Zahlung: Kosten für Lagerung, erneute Zustellung oder Rücksendung aufgrund falscher Angaben können dem Kunden berechnet werden.", "Vérifiez toujours l’adresse avant le paiement : les frais de stockage, de nouvelle livraison ou de retour dus à des informations erronées pourront être facturés au client."],
  ["Ogni ordine viene imballato con cura per proteggere il prodotto durante il trasporto. Per informazioni su resi e rimborsi consulta la pagina", "Every order is packed carefully to protect the product in transit. For return and refund information, see", "Cada pedido se embala cuidadosamente para proteger el producto durante el transporte. Para información sobre devoluciones y reembolsos, consulta", "Jede Bestellung wird sorgfältig verpackt, um das Produkt beim Transport zu schützen. Informationen zu Rückgabe und Erstattung findest du unter", "Chaque commande est emballée avec soin pour protéger le produit pendant le transport. Pour les retours et remboursements, consultez"],
  ["Accettiamo resi sia per ripensamento sia per prodotti difettosi o non conformi, nel rispetto delle condizioni indicate qui sotto.", "We accept returns for change of mind as well as defective or non-compliant products, subject to the conditions below.", "Aceptamos devoluciones tanto por cambio de opinión como por productos defectuosos o no conformes, según las condiciones siguientes.", "Wir akzeptieren Rückgaben bei Meinungsänderung sowie bei mangelhaften oder nicht konformen Produkten unter den nachstehenden Bedingungen.", "Nous acceptons les retours en cas de changement d’avis ainsi que pour les produits défectueux ou non conformes, selon les conditions ci-dessous."],
  ["14 giorni di calendario dalla consegna", "14 calendar days from delivery", "14 días naturales desde la entrega", "14 Kalendertage ab Zustellung", "14 jours calendaires après la livraison"],
  ["Per posta, con consegna al corriere o al punto indicato", "By post, handed to the carrier or specified drop-off point", "Por correo, entregándolo al transportista o en el punto indicado", "Per Post, Übergabe an den Versanddienstleister oder die angegebene Annahmestelle", "Par voie postale, remis au transporteur ou au point indiqué"],
  ["Gratuito: spese a carico di MIRAI", "Free: costs paid by MIRAI", "Gratuito: gastos a cargo de MIRAI", "Kostenlos: Kosten trägt MIRAI", "Gratuit : frais pris en charge par MIRAI"],
  ["Nessuno (0,00 EUR)", "None (€0.00)", "Ninguno (0,00 EUR)", "Keine (0,00 EUR)", "Aucun (0,00 EUR)"],
  ["Prodotti non utilizzati, non lavati e non danneggiati", "Unused, unwashed and undamaged products", "Productos sin usar, sin lavar y sin daños", "Unbenutzte, ungewaschene und unbeschädigte Produkte", "Produits non utilisés, non lavés et non endommagés"],
  ["Cartellini originali, confezione e accessori presenti", "Original tags, packaging and accessories included", "Etiquetas originales, embalaje y accesorios incluidos", "Originaletiketten, Verpackung und Zubehör vorhanden", "Étiquettes d’origine, emballage et accessoires présents"],
  ["Richiesta inviata entro 14 giorni dalla data di consegna", "Request submitted within 14 days of delivery", "Solicitud enviada dentro de los 14 días desde la entrega", "Antrag innerhalb von 14 Tagen nach Zustellung gestellt", "Demande envoyée dans les 14 jours suivant la livraison"],
  ["Prodotti difettosi o non conformi segnalati appena rilevati", "Defective or non-compliant products reported as soon as discovered", "Productos defectuosos o no conformes comunicados en cuanto se detecten", "Mangelhafte oder nicht konforme Produkte sofort nach Feststellung gemeldet", "Produits défectueux ou non conformes signalés dès leur constatation"],
  ["Prodotti personalizzati o customizzati, salvo difetto o non conformita", "Personalised or customised products, unless defective or non-compliant", "Productos personalizados, salvo defecto o falta de conformidad", "Personalisierte Produkte, außer bei Mangel oder Nichtkonformität", "Produits personnalisés, sauf défaut ou non-conformité"],
  ["Prodotti indossati, lavati, alterati o privi di cartellini", "Products that have been worn, washed, altered or have no tags", "Productos usados, lavados, alterados o sin etiquetas", "Getragene, gewaschene, veränderte Produkte oder Produkte ohne Etiketten", "Produits portés, lavés, modifiés ou sans étiquettes"],
  ["Resi inviati senza approvazione o oltre il termine indicato", "Returns sent without approval or after the stated deadline", "Devoluciones enviadas sin aprobación o fuera de plazo", "Ohne Genehmigung oder nach Ablauf der Frist versandte Rückgaben", "Retours envoyés sans autorisation ou hors délai"],
  ["Danni causati da uso improprio, lavaggio errato o normale usura", "Damage caused by misuse, incorrect washing or normal wear", "Daños causados por uso indebido, lavado incorrecto o desgaste normal", "Schäden durch unsachgemäße Nutzung, falsches Waschen oder normale Abnutzung", "Dommages causés par un usage inapproprié, un mauvais lavage ou l’usure normale"],
  ["Per ogni reso approvato in Italia, MIRAI sostiene integralmente le spese di restituzione e invia un'etichetta prepagata. Il costo per il cliente è 0,00 EUR e non viene detratto alcun importo dal rimborso. Non spedire il prodotto prima di aver ricevuto le istruzioni via email.", "For every approved return in Italy, MIRAI covers all return shipping costs and provides a prepaid label. The customer pays €0.00 and nothing is deducted from the refund. Do not send the product before receiving instructions by email.", "Para cada devolución aprobada en Italia, MIRAI cubre íntegramente los gastos y envía una etiqueta prepagada. El coste para el cliente es de 0,00 EUR y no se deduce nada del reembolso. No envíes el producto antes de recibir las instrucciones por email.", "Für jede genehmigte Rückgabe in Italien übernimmt MIRAI die gesamten Rücksendekosten und stellt ein vorausbezahltes Etikett bereit. Für den Kunden entstehen 0,00 EUR und es wird nichts von der Erstattung abgezogen. Versende das Produkt erst nach Erhalt der Anweisungen per E-Mail.", "Pour chaque retour approuvé en Italie, MIRAI prend intégralement en charge les frais et fournit une étiquette prépayée. Le coût pour le client est de 0,00 EUR et rien n’est déduit du remboursement. N’expédiez pas le produit avant d’avoir reçu les instructions par e-mail."],
  ["MIRAI non applica costi di reintegro magazzino o restocking fee: il costo è 0,00 EUR.", "MIRAI charges no restocking fee: the cost is €0.00.", "MIRAI no aplica gastos de reposición: el coste es de 0,00 EUR.", "MIRAI erhebt keine Wiedereinlagerungsgebühr: Die Kosten betragen 0,00 EUR.", "MIRAI ne facture aucun frais de restockage : le coût est de 0,00 EUR."],
  ["Dopo aver ricevuto e controllato il prodotto, emettiamo il rimborso entro 14 giorni sullo stesso metodo di pagamento usato dal cliente al checkout. I tempi di accredito effettivi dipendono dal circuito di pagamento o dalla banca.", "After receiving and checking the product, we issue the refund within 14 days to the payment method used at checkout. Actual credit times depend on the payment network or bank.", "Tras recibir y comprobar el producto, emitimos el reembolso en un plazo de 14 días al mismo método de pago utilizado. El abono efectivo depende de la red de pago o del banco.", "Nach Erhalt und Prüfung des Produkts veranlassen wir die Erstattung innerhalb von 14 Tagen auf die beim Checkout verwendete Zahlungsart. Die tatsächliche Gutschrift hängt vom Zahlungsanbieter oder der Bank ab.", "Après réception et contrôle du produit, nous effectuons le remboursement sous 14 jours sur le moyen de paiement utilisé. Le délai de crédit effectif dépend du réseau de paiement ou de la banque."],
  ["Crea il tuo pezzo", "Create your piece", "Crea tu prenda", "Gestalte dein Teil", "Créez votre pièce"],
  ["Colore del capo", "Garment colour", "Color de la prenda", "Farbe des Kleidungsstücks", "Couleur du vêtement"],
  ["Tipo di design", "Design type", "Tipo de diseño", "Designart", "Type de design"],
  ["Posizione e dimensione", "Position and size", "Posición y tamaño", "Position und Größe", "Position et taille"],
  ["Scegli la taglia", "Choose a size", "Elige la talla", "Größe wählen", "Choisissez la taille"],
  ["Fronte", "Front", "Parte delantera", "Vorderseite", "Devant"],
  ["Retro", "Back", "Parte trasera", "Rückseite", "Dos"],
  ["Testo", "Text", "Texto", "Text", "Texte"],
  ["Grafica", "Artwork", "Gráfico", "Grafik", "Visuel"],
  ["Dimensione", "Size", "Tamaño", "Größe", "Taille"],
  ["Orizzontale", "Horizontal", "Horizontal", "Horizontal", "Horizontal"],
  ["Verticale", "Vertical", "Vertical", "Vertikal", "Vertical"],
  ["Prezzo", "Price", "Precio", "Preis", "Prix"],
  ["Scrivi il tuo messaggio", "Write your message", "Escribe tu mensaje", "Schreibe deine Nachricht", "Écrivez votre message"],
  ["Sto preparando la grafica…", "Preparing your artwork…", "Preparando tu gráfico…", "Grafik wird vorbereitet…", "Préparation de votre visuel…"],
  ["Carica una grafica per completare il progetto", "Upload artwork to complete your design", "Sube un gráfico para completar el diseño", "Lade eine Grafik hoch, um das Design fertigzustellen", "Importez un visuel pour terminer votre création"],
  ["Progetto pronto per il carrello", "Design ready for the cart", "Diseño listo para el carrito", "Design bereit für den Warenkorb", "Création prête pour le panier"],
  ["Formato non supportato. Usa PNG, JPG, WebP o AVIF.", "Unsupported format. Use PNG, JPG, WebP or AVIF.", "Formato no compatible. Usa PNG, JPG, WebP o AVIF.", "Nicht unterstütztes Format. Verwende PNG, JPG, WebP oder AVIF.", "Format non pris en charge. Utilisez PNG, JPG, WebP ou AVIF."],
  ["La grafica supera 5 MB. Riducila e riprova.", "The artwork is over 5 MB. Reduce it and try again.", "El gráfico supera los 5 MB. Redúcelo e inténtalo de nuevo.", "Die Grafik ist größer als 5 MB. Verkleinere sie und versuche es erneut.", "Le visuel dépasse 5 Mo. Réduisez-le et réessayez."],
  ["Caricamento in corso…", "Uploading…", "Cargando…", "Wird hochgeladen…", "Importation…"],
  ["Grafica caricata", "Artwork uploaded", "Gráfico cargado", "Grafik hochgeladen", "Visuel importé"],
  ["Trascina qui la tua grafica", "Drag your artwork here", "Arrastra aquí tu gráfico", "Ziehe deine Grafik hierher", "Déposez votre visuel ici"],
  ["Cambia file", "Change file", "Cambiar archivo", "Datei ändern", "Changer le fichier"],
  ["Scegli file", "Choose file", "Elegir archivo", "Datei auswählen", "Choisir un fichier"],
  ["Fit oversize heavyweight. Scegli la tua taglia abituale.", "Heavyweight oversized fit. Choose your usual size.", "Corte oversize heavyweight. Elige tu talla habitual.", "Schwere Oversized-Passform. Wähle deine übliche Größe.", "Coupe oversize heavyweight. Choisissez votre taille habituelle."],
  ["Heavy Tee + 1 stampa inclusa", "Heavy Tee + 1 print included", "Heavy Tee + 1 estampado incluido", "Heavy Tee + 1 Druck inklusive", "Heavy Tee + 1 impression incluse"],
  ["Aggiunta al carrello", "Added to cart", "Añadida al carrito", "Zum Warenkorb hinzugefügt", "Ajoutée au panier"],
  ["Ordina la tua Custom Tee", "Order your Custom Tee", "Pide tu Custom Tee", "Bestelle dein Custom Tee", "Commandez votre Custom Tee"],
  ["Anteprima indicativa · Controllo manuale prima della stampa", "Preview for guidance · Manual review before printing", "Vista previa orientativa · Revisión manual antes de imprimir", "Vorschau zur Orientierung · Manuelle Prüfung vor dem Druck", "Aperçu indicatif · Contrôle manuel avant impression"],
  ["Personalizzato secondo il tuo stile", "Customised to your style", "Personalizado según tu estilo", "Nach deinem Stil personalisiert", "Personnalisé selon votre style"],
  ["I prodotti custom non possono essere restituiti, salvo difetti di produzione.", "Custom products cannot be returned unless they have a manufacturing defect.", "Los productos personalizados no se pueden devolver salvo defecto de fabricación.", "Personalisierte Produkte können nur bei Herstellungsfehlern zurückgegeben werden.", "Les produits personnalisés ne peuvent être retournés qu’en cas de défaut de fabrication."],
  ["Costruisci", "Build", "Construye", "Gestalte", "Construisez"],
  ["con noi.", "with us.", "con nosotros.", "mit uns.", "avec nous."],
  ["Prima degli altri", "Before everyone else", "Antes que nadie", "Vor allen anderen", "Avant tout le monde"],
  ["Partecipa alle scelte", "Take part in the decisions", "Participa en las decisiones", "Entscheide mit", "Participez aux choix"],
  ["Porta il tuo stile", "Bring your style", "Aporta tu estilo", "Bring deinen Stil ein", "Apportez votre style"],
  ["Vivi MIRAI", "Experience MIRAI", "Vive MIRAI", "Erlebe MIRAI", "Vivez MIRAI"],
  ["Apri il Society Hub", "Open the Society Hub", "Abrir el Society Hub", "Society Hub öffnen", "Ouvrir le Society Hub"],
  ["Entra nella Society", "Join the Society", "Únete a la Society", "Der Society beitreten", "Rejoindre la Society"],
  ["Sono già membro", "I’m already a member", "Ya soy miembro", "Ich bin bereits Mitglied", "Je suis déjà membre"],
  ["La Society parte dal tuo account.", "The Society starts with your account.", "La Society comienza con tu cuenta.", "Die Society beginnt mit deinem Konto.", "La Society commence avec votre compte."],
  ["Il tuo accesso alla parte interna di MIRAI.", "Your access to the inside of MIRAI.", "Tu acceso al universo interno de MIRAI.", "Dein Zugang zur inneren Welt von MIRAI.", "Votre accès à l’univers intérieur de MIRAI."],
  ["Dentro il network", "Inside the network", "Dentro de la red", "Im Netzwerk", "Au cœur du réseau"],
  ["Entra nel canale", "Enter the channel", "Entrar en el canal", "Kanal öffnen", "Entrer dans le canal"],
  ["Scopri l’accesso", "Discover access", "Descubrir el acceso", "Zugang entdecken", "Découvrir l’accès"],
  ["Aperto", "Open", "Abierto", "Offen", "Ouvert"],
  ["Attivo", "Active", "Activo", "Aktiv", "Actif"],
  ["Membro", "Member", "Miembro", "Mitglied", "Membre"],
  ["MIRAI10 o un altro codice sconto va applicato prima di scegliere il metodo di pagamento.", "MIRAI10 or another discount code must be applied before choosing the payment method.", "MIRAI10 u otro código de descuento debe aplicarse antes de elegir el método de pago.", "MIRAI10 oder ein anderer Rabattcode muss vor Auswahl der Zahlungsart angewendet werden.", "MIRAI10 ou un autre code promo doit être appliqué avant de choisir le mode de paiement."],
  ["Il pagamento in contrassegno è disponibile solo per gli ordini che contengono esclusivamente prodotti del brand Minimal.", "Cash on delivery is available only for orders containing exclusively Minimal brand products.", "El pago contra reembolso solo está disponible para pedidos que contengan exclusivamente productos de la marca Minimal.", "Nachnahme ist nur für Bestellungen verfügbar, die ausschließlich Produkte der Marke Minimal enthalten.", "Le paiement à la livraison est disponible uniquement pour les commandes contenant exclusivement des produits Minimal."],
  ["Desidero ricevere promemoria sul carrello e novita MIRAI. Richiede un indirizzo email.", "I’d like to receive cart reminders and MIRAI news. An email address is required.", "Quiero recibir recordatorios del carrito y novedades MIRAI. Se necesita una dirección de email.", "Ich möchte Warenkorberinnerungen und MIRAI-Neuigkeiten erhalten. Eine E-Mail-Adresse ist erforderlich.", "Je souhaite recevoir des rappels de panier et les actualités MIRAI. Une adresse e-mail est requise."],
  ["Scegli il metodo di pagamento disponibile nel checkout protetto di Stripe e completa i dati di spedizione.", "Choose an available payment method in Stripe’s secure checkout and complete your shipping details.", "Elige un método de pago disponible en el checkout seguro de Stripe y completa los datos de envío.", "Wähle im geschützten Stripe-Checkout eine verfügbare Zahlungsart und vervollständige die Versanddaten.", "Choisissez un mode de paiement dans le checkout sécurisé Stripe et renseignez les informations de livraison."],
  ["La configurazione Stripe non è disponibile. Puoi scegliere il contrassegno oppure contattare l'assistenza.", "Stripe is not available. You can choose cash on delivery or contact support.", "Stripe no está disponible. Puedes elegir el pago contra reembolso o contactar con asistencia.", "Stripe ist nicht verfügbar. Du kannst Nachnahme wählen oder den Support kontaktieren.", "Stripe n’est pas disponible. Vous pouvez choisir le paiement à la livraison ou contacter l’assistance."],
  ["Pagherai al corriere quando riceverai il tuo ordine. Il totale include un supplemento fisso di €9,00. Disponibile solo in Italia.", "You’ll pay the carrier when your order arrives. The total includes a fixed €9.00 surcharge. Available in Italy only.", "Pagarás al transportista al recibir el pedido. El total incluye un suplemento fijo de 9,00 €. Disponible solo en Italia.", "Du bezahlst beim Versanddienstleister, wenn die Bestellung eintrifft. Der Gesamtbetrag enthält einen festen Zuschlag von 9,00 €. Nur in Italien verfügbar.", "Vous paierez le transporteur à la réception. Le total comprend un supplément fixe de 9,00 €. Disponible uniquement en Italie."],
  ["Gestisci le informazioni del tuo profilo", "Manage your profile information", "Gestiona la información de tu perfil", "Verwalte deine Profilinformationen", "Gérez les informations de votre profil"],
  ["Profilo", "Profile", "Perfil", "Profil", "Profil"],
  ["I tuoi dati personali", "Your personal details", "Tus datos personales", "Deine persönlichen Daten", "Vos informations personnelles"],
  ["Non specificato", "Not specified", "No especificado", "Nicht angegeben", "Non renseigné"],
  ["Ruolo", "Role", "Rol", "Rolle", "Rôle"],
  ["Membro dal", "Member since", "Miembro desde", "Mitglied seit", "Membre depuis"],
  ["Ordini", "Orders", "Pedidos", "Bestellungen", "Commandes"],
  ["I tuoi ordini recenti", "Your recent orders", "Tus pedidos recientes", "Deine letzten Bestellungen", "Vos commandes récentes"],
  ["Nessun ordine ancora. Inizia a esplorare il nostro catalogo.", "No orders yet. Start exploring our catalogue.", "Aún no hay pedidos. Empieza a explorar nuestro catálogo.", "Noch keine Bestellungen. Entdecke jetzt unseren Katalog.", "Aucune commande pour le moment. Découvrez notre catalogue."],
  ["Esplora prodotti", "Explore products", "Explorar productos", "Produkte entdecken", "Découvrir les produits"],
  ["Stiamo ricevendo la conferma del pagamento. Aggiorna questa pagina tra qualche istante.", "We’re waiting for payment confirmation. Refresh this page in a moment.", "Estamos esperando la confirmación del pago. Actualiza esta página dentro de unos instantes.", "Wir warten auf die Zahlungsbestätigung. Aktualisiere diese Seite in Kürze.", "Nous attendons la confirmation du paiement. Actualisez cette page dans quelques instants."],
  ["Pagherai al corriere al momento della consegna. Il tuo ordine e ora in attesa di conferma.", "You’ll pay the carrier on delivery. Your order is now awaiting confirmation.", "Pagarás al transportista en el momento de la entrega. Tu pedido está pendiente de confirmación.", "Du bezahlst bei der Lieferung. Deine Bestellung wartet jetzt auf Bestätigung.", "Vous paierez le transporteur à la livraison. Votre commande est en attente de confirmation."],
  ["Continua", "Continue", "Continuar", "Weiter", "Continuer"],
  ["Ordine non disponibile", "Order unavailable", "Pedido no disponible", "Bestellung nicht verfügbar", "Commande indisponible"],
  ["Accedi con il MIRAI PASS usato per il pagamento per visualizzare la conferma e i tuoi ordini.", "Sign in with the MIRAI PASS used for payment to view the confirmation and your orders.", "Inicia sesión con el MIRAI PASS utilizado para el pago para ver la confirmación y tus pedidos.", "Melde dich mit dem für die Zahlung verwendeten MIRAI PASS an, um die Bestätigung und deine Bestellungen anzusehen.", "Connectez-vous avec le MIRAI PASS utilisé pour le paiement afin d’afficher la confirmation et vos commandes."],
  ["Vai al mio account", "Go to my account", "Ir a mi cuenta", "Zu meinem Konto", "Accéder à mon compte"],
  ["Grazie per il tuo ordine", "Thank you for your order", "Gracias por tu pedido", "Vielen Dank für deine Bestellung", "Merci pour votre commande"],
  ["Ordine", "Order", "Pedido", "Bestellung", "Commande"],
  ["Continua lo shopping", "Continue shopping", "Seguir comprando", "Weiter einkaufen", "Continuer mes achats"],
  ["Inserisci le tue credenziali per accedere al tuo account", "Enter your credentials to access your account", "Introduce tus datos para acceder a tu cuenta", "Gib deine Zugangsdaten ein, um auf dein Konto zuzugreifen", "Saisissez vos identifiants pour accéder à votre compte"],
  ["Torna alla home", "Back to home", "Volver al inicio", "Zur Startseite", "Retour à l’accueil"],
  ["Entra nella MIRAI Society", "Join the MIRAI Society", "Únete a MIRAI Society", "Werde Teil der MIRAI Society", "Rejoignez la MIRAI Society"],
  ["Crea il tuo account per accedere alla community, alle anteprime e agli eventi.", "Create your account to access the community, previews and events.", "Crea tu cuenta para acceder a la comunidad, los avances y los eventos.", "Erstelle dein Konto, um auf die Community, Previews und Events zuzugreifen.", "Créez votre compte pour accéder à la communauté, aux avant-premières et aux événements."],
  ["Cognome", "Last name", "Apellidos", "Nachname", "Nom"],
  ["Conferma Password", "Confirm password", "Confirmar contraseña", "Passwort bestätigen", "Confirmer le mot de passe"],
  ["Desidero ricevere novità, offerte e vantaggi riservati della community MIRAI via email. Posso revocare il consenso in qualsiasi momento. Consulta la", "I’d like to receive MIRAI community news, offers and exclusive benefits by email. I can withdraw my consent at any time. See the", "Quiero recibir por email novedades, ofertas y ventajas exclusivas de la comunidad MIRAI. Puedo retirar mi consentimiento en cualquier momento. Consulta la", "Ich möchte per E-Mail Neuigkeiten, Angebote und exklusive Vorteile der MIRAI Community erhalten. Ich kann meine Einwilligung jederzeit widerrufen. Siehe", "Je souhaite recevoir par e-mail les actualités, offres et avantages exclusifs de la communauté MIRAI. Je peux retirer mon consentement à tout moment. Consultez la"],
  ["Creazione in corso...", "Creating account...", "Creando la cuenta...", "Konto wird erstellt...", "Création du compte..."],
  ["Crea account Society", "Create Society account", "Crear cuenta Society", "Society-Konto erstellen", "Créer un compte Society"],
  ["Hai gia un account?", "Already have an account?", "¿Ya tienes una cuenta?", "Du hast bereits ein Konto?", "Vous avez déjà un compte ?"],
  ["Recupera la password", "Reset your password", "Recupera tu contraseña", "Passwort zurücksetzen", "Réinitialiser votre mot de passe"],
  ["Inserisci l'email del tuo MIRAI PASS. Riceverai un link sicuro per scegliere una nuova password.", "Enter the email address for your MIRAI PASS. You’ll receive a secure link to choose a new password.", "Introduce el email de tu MIRAI PASS. Recibirás un enlace seguro para elegir una nueva contraseña.", "Gib die E-Mail-Adresse deines MIRAI PASS ein. Du erhältst einen sicheren Link, um ein neues Passwort zu wählen.", "Saisissez l’adresse e-mail de votre MIRAI PASS. Vous recevrez un lien sécurisé pour choisir un nouveau mot de passe."],
  ["Controlla la posta in arrivo. Se l'indirizzo e registrato, il link arrivera tra pochi minuti.", "Check your inbox. If the address is registered, the link will arrive within a few minutes.", "Comprueba tu bandeja de entrada. Si la dirección está registrada, el enlace llegará en unos minutos.", "Prüfe deinen Posteingang. Wenn die Adresse registriert ist, kommt der Link in wenigen Minuten an.", "Consultez votre boîte de réception. Si l’adresse est enregistrée, le lien arrivera dans quelques minutes."],
  ["Invio in corso...", "Sending...", "Enviando...", "Wird gesendet...", "Envoi..."],
  ["Password aggiornata", "Password updated", "Contraseña actualizada", "Passwort aktualisiert", "Mot de passe mis à jour"],
  ["Scegli una nuova password", "Choose a new password", "Elige una nueva contraseña", "Neues Passwort wählen", "Choisissez un nouveau mot de passe"],
  ["La nuova password del tuo MIRAI PASS e attiva.", "Your new MIRAI PASS password is active.", "La nueva contraseña de tu MIRAI PASS está activa.", "Dein neues MIRAI PASS Passwort ist aktiv.", "Le nouveau mot de passe de votre MIRAI PASS est actif."],
  ["Vai al login", "Go to sign in", "Ir al inicio de sesión", "Zur Anmeldung", "Aller à la connexion"],
  ["Apri questa pagina dal link ricevuto via email.", "Open this page using the link you received by email.", "Abre esta página desde el enlace recibido por email.", "Öffne diese Seite über den Link aus der E-Mail.", "Ouvrez cette page depuis le lien reçu par e-mail."],
  ["Nuova password", "New password", "Nueva contraseña", "Neues Passwort", "Nouveau mot de passe"],
  ["Aggiornamento...", "Updating...", "Actualizando...", "Wird aktualisiert...", "Mise à jour..."],
  ["Aggiorna password", "Update password", "Actualizar contraseña", "Passwort aktualisieren", "Mettre à jour le mot de passe"],
  ["Attivazione MIRAI Society", "Activating MIRAI Society", "Activando MIRAI Society", "MIRAI Society wird aktiviert", "Activation de la MIRAI Society"],
  ["Account Society attivo", "Society account active", "Cuenta Society activa", "Society-Konto aktiv", "Compte Society actif"],
  ["Link non valido o scaduto", "Invalid or expired link", "Enlace no válido o caducado", "Ungültiger oder abgelaufener Link", "Lien invalide ou expiré"],
  ["Stiamo verificando la tua email e preparando il tuo accesso.", "We’re verifying your email and preparing your access.", "Estamos verificando tu email y preparando tu acceso.", "Wir bestätigen deine E-Mail und bereiten deinen Zugang vor.", "Nous vérifions votre e-mail et préparons votre accès."],
  ["Tutto pronto. Stai tornando al tuo percorso.", "Everything is ready. You’re returning to your journey.", "Todo está listo. Estás volviendo a tu recorrido.", "Alles ist bereit. Du kehrst zu deinem Weg zurück.", "Tout est prêt. Vous reprenez votre parcours."],
  ["Prova ad accedere con le tue credenziali oppure ripeti la registrazione.", "Try signing in with your credentials or register again.", "Intenta iniciar sesión con tus datos o vuelve a registrarte.", "Versuche dich mit deinen Zugangsdaten anzumelden oder registriere dich erneut.", "Essayez de vous connecter avec vos identifiants ou recommencez l’inscription."],
  ["Controlla la tua email", "Check your email", "Comprueba tu email", "Prüfe deine E-Mail", "Consultez votre e-mail"],
  ["Ti abbiamo inviato il link per attivare il tuo account MIRAI Society. Dopo la conferma entrerai direttamente nel Society Hub.", "We sent you a link to activate your MIRAI Society account. After confirmation, you’ll enter the Society Hub directly.", "Te hemos enviado un enlace para activar tu cuenta MIRAI Society. Tras confirmarla, accederás directamente al Society Hub.", "Wir haben dir einen Link zur Aktivierung deines MIRAI Society Kontos geschickt. Nach der Bestätigung gelangst du direkt zum Society Hub.", "Nous vous avons envoyé un lien pour activer votre compte MIRAI Society. Après confirmation, vous accéderez directement au Society Hub."],
  ["Si è verificato un errore", "An error occurred", "Se ha producido un error", "Ein Fehler ist aufgetreten", "Une erreur s’est produite"],
  ["Si è verificato un errore non specificato. Riprova più tardi.", "An unspecified error occurred. Please try again later.", "Se ha producido un error no especificado. Inténtalo de nuevo más tarde.", "Ein nicht näher bezeichneter Fehler ist aufgetreten. Versuche es später erneut.", "Une erreur non spécifiée s’est produite. Réessayez plus tard."],
  ["Torna al login", "Back to sign in", "Volver al inicio de sesión", "Zurück zur Anmeldung", "Retour à la connexion"],
  ["Pagamento Annullato", "Payment cancelled", "Pago cancelado", "Zahlung abgebrochen", "Paiement annulé"],
  ["Il pagamento è stato annullato. Non ti è stato addebitato nulla. Il tuo carrello è ancora disponibile se desideri completare l'acquisto.", "The payment was cancelled. You haven’t been charged. Your cart is still available if you’d like to complete your purchase.", "El pago se ha cancelado. No se te ha cobrado nada. Tu carrito sigue disponible si quieres completar la compra.", "Die Zahlung wurde abgebrochen. Es wurde nichts berechnet. Dein Warenkorb ist weiterhin verfügbar, falls du den Kauf abschließen möchtest.", "Le paiement a été annulé. Aucun montant n’a été débité. Votre panier reste disponible si vous souhaitez finaliser votre achat."],
  ["Se hai riscontrato problemi durante il pagamento o hai domande, non esitare a contattarci. Siamo qui per aiutarti!", "If you had trouble with payment or have any questions, please contact us. We’re here to help.", "Si has tenido problemas con el pago o tienes preguntas, ponte en contacto con nosotros. Estamos aquí para ayudarte.", "Wenn es bei der Zahlung Probleme gab oder du Fragen hast, kontaktiere uns. Wir helfen dir gerne.", "Si vous avez rencontré un problème de paiement ou avez des questions, contactez-nous. Nous sommes là pour vous aider."],
  ["Torna al Carrello", "Back to cart", "Volver al carrito", "Zurück zum Warenkorb", "Retour au panier"],
  ["Torna alla Home", "Back to home", "Volver al inicio", "Zur Startseite", "Retour à l’accueil"],
  ["Chiudi offerta", "Close offer", "Cerrar oferta", "Angebot schließen", "Fermer l’offre"],
  ["Inserisci questo codice nel checkout. Lo sconto verrà calcolato immediatamente sul totale dei prodotti.", "Enter this code at checkout. The discount will be applied immediately to the product total.", "Introduce este código en el checkout. El descuento se aplicará inmediatamente al total de los productos.", "Gib diesen Code an der Kasse ein. Der Rabatt wird sofort auf die Produktsumme angewendet.", "Saisissez ce code au paiement. La réduction sera immédiatement appliquée au total des produits."],
  ["Riduci quantità", "Decrease quantity", "Reducir cantidad", "Menge verringern", "Réduire la quantité"],
  ["Aumenta quantità", "Increase quantity", "Aumentar cantidad", "Menge erhöhen", "Augmenter la quantité"],
  ["Torna alla Home", "Back to Home", "Volver al inicio", "Zur Startseite", "Retour à l’accueil"],
]

const localeIndex: Record<Locale, number> = { it: 0, en: 1, es: 2, de: 3, fr: 4 }
const exactPhraseMap = new Map(phraseRows.map((row) => [row[0], row]))
const normalizedPhraseMap = new Map(phraseRows.map((row) => [row[0].replace(/\s+/g, " ").trim(), row]))

function preserveWhitespace(source: string, value: string) {
  const leading = source.match(/^\s*/)?.[0] || ""
  const trailing = source.match(/\s*$/)?.[0] || ""
  return `${leading}${value}${trailing}`
}

export function translateSiteText(source: string, locale: Locale) {
  if (locale === "it" || !source.trim()) return source
  const trimmed = source.trim()
  const exact = exactPhraseMap.get(trimmed) || normalizedPhraseMap.get(trimmed.replace(/\s+/g, " "))
  if (exact) return preserveWhitespace(source, exact[localeIndex[locale]])

  const orderItems = trimmed.match(/^(\d+)\s+articoli$/i)
  if (orderItems) {
    const count = Number(orderItems[1])
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `${count} ${count === 1 ? "item" : "items"}`,
      es: `${count} ${count === 1 ? "artículo" : "artículos"}`,
      de: `${count} ${count === 1 ? "Artikel" : "Artikel"}`,
      fr: `${count} ${count === 1 ? "article" : "articles"}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const errorCode = trimmed.match(/^Codice errore:\s*(.+)$/i)
  if (errorCode) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Error code: ${errorCode[1]}`,
      es: `Código de error: ${errorCode[1]}`,
      de: `Fehlercode: ${errorCode[1]}`,
      fr: `Code d’erreur : ${errorCode[1]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const supportCode = trimmed.match(/^Codice assistenza:\s*(.+)$/i)
  if (supportCode) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Support code: ${supportCode[1]}`,
      es: `Código de asistencia: ${supportCode[1]}`,
      de: `Supportcode: ${supportCode[1]}`,
      fr: `Code d’assistance : ${supportCode[1]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const paymentConfirmation = trimmed.match(/^La conferma di pagamento e stata inviata a (.+)\. Prepariamo il tuo ordine e ti avviseremo alla spedizione\.$/i)
  if (paymentConfirmation) {
    const email = paymentConfirmation[1]
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Payment confirmation was sent to ${email}. We’re preparing your order and will notify you when it ships.`,
      es: `La confirmación del pago se ha enviado a ${email}. Estamos preparando tu pedido y te avisaremos cuando se envíe.`,
      de: `Die Zahlungsbestätigung wurde an ${email} gesendet. Wir bereiten deine Bestellung vor und informieren dich beim Versand.`,
      fr: `La confirmation de paiement a été envoyée à ${email}. Nous préparons votre commande et vous informerons lors de son expédition.`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const monthlySold = trimmed.match(/^Venduti questo mese:\s*(\d+)$/)
  if (monthlySold) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Sold this month: ${monthlySold[1]}`,
      es: `Vendidos este mes: ${monthlySold[1]}`,
      de: `Diesen Monat verkauft: ${monthlySold[1]}`,
      fr: `Vendus ce mois-ci : ${monthlySold[1]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const productCode = trimmed.match(/^Codice prodotto\s+(.+)$/)
  if (productCode) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Product code ${productCode[1]}`,
      es: `Código de producto ${productCode[1]}`,
      de: `Produktcode ${productCode[1]}`,
      fr: `Code produit ${productCode[1]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const guestEmail = trimmed.match(/^Acquisto come ospite:\s*(.+)$/)
  if (guestEmail) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Guest checkout: ${guestEmail[1]}`,
      es: `Compra como invitado: ${guestEmail[1]}`,
      de: `Gastbestellung: ${guestEmail[1]}`,
      fr: `Achat invité : ${guestEmail[1]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const productCount = trimmed.match(/^(\d+)\s+(prodotto|prodotti)$/i)
  if (productCount) {
    const count = Number(productCount[1])
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `${count} ${count === 1 ? "product" : "products"}`,
      es: `${count} ${count === 1 ? "producto" : "productos"}`,
      de: `${count} ${count === 1 ? "Produkt" : "Produkte"}`,
      fr: `${count} ${count === 1 ? "produit" : "produits"}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const size = trimmed.match(/^Taglia\s+(.+)$/i)
  if (size) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Size ${size[1]}`,
      es: `Talla ${size[1]}`,
      de: `Größe ${size[1]}`,
      fr: `Taille ${size[1]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const appliedCode = trimmed.match(/^Codice\s+(.+)\s+applicato$/i)
  if (appliedCode) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Code ${appliedCode[1]} applied`,
      es: `Código ${appliedCode[1]} aplicado`,
      de: `Code ${appliedCode[1]} angewendet`,
      fr: `Code ${appliedCode[1]} appliqué`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const savings = trimmed.match(/^Risparmi\s+(.+)$/i)
  if (savings) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `You save ${savings[1]}`,
      es: `Ahorras ${savings[1]}`,
      de: `Du sparst ${savings[1]}`,
      fr: `Vous économisez ${savings[1]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  const imagePosition = trimmed.match(/^Mostra immagine\s+(\d+)\s+di\s+(\d+)$/i)
  if (imagePosition) {
    const labels: Record<Exclude<Locale, "it">, string> = {
      en: `Show image ${imagePosition[1]} of ${imagePosition[2]}`,
      es: `Mostrar imagen ${imagePosition[1]} de ${imagePosition[2]}`,
      de: `Bild ${imagePosition[1]} von ${imagePosition[2]} anzeigen`,
      fr: `Afficher l’image ${imagePosition[1]} sur ${imagePosition[2]}`,
    }
    return preserveWhitespace(source, labels[locale])
  }

  return source
}

const categoryCopy: Record<string, Record<Locale, string>> = {
  camicie: { it: "Camicie", en: "Shirts", es: "Camisas", de: "Hemden", fr: "Chemises" },
  canotte: { it: "Canotte", en: "Tank tops", es: "Camisetas sin mangas", de: "Tank-Tops", fr: "Débardeurs" },
  felpe: { it: "Felpe", en: "Hoodies", es: "Sudaderas", de: "Hoodies", fr: "Sweats" },
  headwear: { it: "Cappelli", en: "Headwear", es: "Gorras", de: "Caps", fr: "Casquettes" },
  cappelli: { it: "Cappelli", en: "Headwear", es: "Gorras", de: "Caps", fr: "Casquettes" },
  jeans: { it: "Jeans", en: "Jeans", es: "Vaqueros", de: "Jeans", fr: "Jeans" },
  profumi: { it: "Profumi", en: "Fragrances", es: "Perfumes", de: "Düfte", fr: "Parfums" },
  shorts: { it: "Shorts", en: "Shorts", es: "Pantalones cortos", de: "Shorts", fr: "Shorts" },
  pantaloni: { it: "Pantaloni", en: "Trousers", es: "Pantalones", de: "Hosen", fr: "Pantalons" },
  "t-shirt": { it: "T-shirt", en: "T-shirts", es: "Camisetas", de: "T-Shirts", fr: "T-shirts" },
  tracksuits: { it: "Tute", en: "Tracksuits", es: "Chándales", de: "Trainingsanzüge", fr: "Survêtements" },
  sunglasses: { it: "Occhiali da sole", en: "Sunglasses", es: "Gafas de sol", de: "Sonnenbrillen", fr: "Lunettes de soleil" },
}

export function translateCategory(slug: string, fallback: string, locale: Locale) {
  return categoryCopy[slug.trim().toLowerCase()]?.[locale] || fallback
}

const catalogExactRows: PhraseRow[] = [
  ["Consulta la guida alle taglie prima di scegliere.", "Check the size guide before choosing.", "Consulta la guía de tallas antes de elegir.", "Bitte prüfe vor der Auswahl die Größentabelle.", "Consultez le guide des tailles avant de choisir."],
  ["Scegli la tua taglia abituale.", "Choose your usual size.", "Elige tu talla habitual.", "Wähle deine übliche Größe.", "Choisissez votre taille habituelle."],
  ["Vestibilità oversize: scegli la tua taglia abituale.", "Oversized fit: choose your usual size.", "Corte oversize: elige tu talla habitual.", "Oversized-Passform: Wähle deine übliche Größe.", "Coupe oversize : choisissez votre taille habituelle."],
  ["Vestibilità ampia: scegli la tua taglia abituale.", "Relaxed fit: choose your usual size.", "Corte amplio: elige tu talla habitual.", "Lockere Passform: Wähle deine übliche Größe.", "Coupe ample : choisissez votre taille habituelle."],
  ["Vestibilità regolare: scegli la tua taglia abituale.", "Regular fit: choose your usual size.", "Corte regular: elige tu talla habitual.", "Reguläre Passform: Wähle deine übliche Größe.", "Coupe regular : choisissez votre taille habituelle."],
  ["Vestibilità oversize d’ispirazione streetwear.", "Streetwear-inspired oversized fit.", "Corte oversize de inspiración streetwear.", "Oversized-Passform im Streetwear-Stil.", "Coupe oversize d’inspiration streetwear."],
  ["Cotone", "Cotton", "Algodón", "Baumwolle", "Coton"],
  ["Denim", "Denim", "Denim", "Denim", "Denim"],
  ["Tessuto camouflage", "Camouflage fabric", "Tejido de camuflaje", "Camouflage-Gewebe", "Tissu camouflage"],
  ["Seguire le istruzioni riportate sull'etichetta interna.", "Follow the instructions on the inside care label.", "Sigue las instrucciones de la etiqueta interior.", "Befolge die Hinweise auf dem innenliegenden Pflegeetikett.", "Suivez les instructions figurant sur l’étiquette intérieure."],
  ["Nero", "Black", "Negro", "Schwarz", "Noir"],
  ["Bianco", "White", "Blanco", "Weiß", "Blanc"],
  ["Rosso", "Red", "Rojo", "Rot", "Rouge"],
  ["Giallo", "Yellow", "Amarillo", "Gelb", "Jaune"],
  ["Lilla", "Lilac", "Lila", "Flieder", "Lilas"],
  ["Bordeaux", "Burgundy", "Burdeos", "Bordeaux", "Bordeaux"],
  ["Nero slavato", "Washed black", "Negro lavado", "Washed Black", "Noir délavé"],
  ["Blu washed", "Washed blue", "Azul lavado", "Washed Blue", "Bleu délavé"],
  ["Verde washed", "Washed green", "Verde lavado", "Washed Green", "Vert délavé"],
  ["Denim blu", "Blue denim", "Denim azul", "Blauer Denim", "Denim bleu"],
  ["Camouflage multicolor", "Multicolour camouflage", "Camuflaje multicolor", "Mehrfarbiges Camouflage", "Camouflage multicolore"],
  ["Panna / Multicolor", "Cream / Multicolour", "Crema / Multicolor", "Creme / Mehrfarbig", "Écru / Multicolore"],
]

const catalogExactMap = new Map(catalogExactRows.map((row) => [row[0], row]))

const catalogFragments: Record<Exclude<Locale, "it">, Array<readonly [string, string]>> = {
  en: [
    ["Vestibilità", "Fit"], ["Taglie disponibili", "Available sizes"], ["Colore:", "Colour:"], ["Motivo:", "Design:"], ["Materiale:", "Material:"],
    ["Lavare al rovescio", "Wash inside out"], ["con ciclo delicato", "on a delicate cycle"], ["a 30°C", "at 30°C"], ["Non stirare direttamente sulla stampa", "Do not iron directly on the print"],
    ["seguire l'etichetta interna", "follow the inside care label"], ["per proteggere", "to protect"], ["Applicazioni", "Applications"], ["applicazioni", "applications"],
    ["Girocollo e manica corta", "Crew neck and short sleeves"], ["Manica corta", "Short sleeves"], ["Chiusura frontale con bottoni", "Front button fastening"],
    ["Maxi grafica frontale", "Oversized front graphic"], ["Maxi stampa posteriore", "Oversized back print"], ["Stampa fronte e retro", "Front and back print"],
    ["Vestibilità ampia", "Relaxed fit"], ["Vestibilità oversize", "Oversized fit"], ["Taglio ampio", "Wide cut"], ["gamba ampia", "wide leg"],
    ["T-shirt oversize", "Oversized T-shirt"], ["Canotta oversize", "Oversized tank top"], ["Camicia oversize", "Oversized shirt"], ["Felpa", "Hoodie"], ["Bermuda", "Denim shorts"],
    ["con", "with"], ["sul fronte", "on the front"], ["sul retro", "on the back"], ["fronte", "front"], ["retro", "back"],
    ["in cotone", "in cotton"], ["in denim", "in denim"], ["effetto washed", "washed effect"], ["lavaggio", "wash"], ["dettagli", "details"],
    ["cristalli", "crystals"], ["strass", "rhinestones"], ["perle", "pearls"], ["grafica", "graphic"], ["stampa", "print"], ["nero", "black"], ["nera", "black"], ["bianco", "white"], ["bianca", "white"], ["blu", "blue"], ["verde", "green"], ["rosso", "red"], ["rossa", "red"],
  ],
  es: [
    ["Vestibilità", "Corte"], ["Taglie disponibili", "Tallas disponibles"], ["Colore:", "Color:"], ["Motivo:", "Diseño:"], ["Materiale:", "Material:"],
    ["Lavare al rovescio", "Lavar del revés"], ["con ciclo delicato", "en ciclo delicado"], ["a 30°C", "a 30°C"], ["Non stirare direttamente sulla stampa", "No planchar directamente sobre el estampado"],
    ["seguire l'etichetta interna", "seguir la etiqueta interior"], ["per proteggere", "para proteger"], ["Applicazioni", "Aplicaciones"], ["applicazioni", "aplicaciones"],
    ["Girocollo e manica corta", "Cuello redondo y manga corta"], ["Manica corta", "Manga corta"], ["Chiusura frontale con bottoni", "Cierre frontal con botones"],
    ["Maxi grafica frontale", "Gráfico frontal maxi"], ["Maxi stampa posteriore", "Estampado trasero maxi"], ["Stampa fronte e retro", "Estampado delantero y trasero"],
    ["Vestibilità ampia", "Corte amplio"], ["Vestibilità oversize", "Corte oversize"], ["Taglio ampio", "Corte amplio"], ["gamba ampia", "pernera ancha"],
    ["T-shirt oversize", "Camiseta oversize"], ["Canotta oversize", "Camiseta sin mangas oversize"], ["Camicia oversize", "Camisa oversize"], ["Felpa", "Sudadera"], ["Bermuda", "Bermuda"],
    ["con", "con"], ["sul fronte", "en la parte delantera"], ["sul retro", "en la parte trasera"], ["fronte", "delantero"], ["retro", "trasero"],
    ["in cotone", "de algodón"], ["in denim", "de denim"], ["effetto washed", "efecto lavado"], ["lavaggio", "lavado"], ["dettagli", "detalles"],
    ["cristalli", "cristales"], ["strass", "strass"], ["perle", "perlas"], ["grafica", "gráfico"], ["stampa", "estampado"], ["nero", "negro"], ["nera", "negra"], ["bianco", "blanco"], ["bianca", "blanca"], ["blu", "azul"], ["verde", "verde"], ["rosso", "rojo"], ["rossa", "roja"],
  ],
  de: [
    ["Vestibilità", "Passform"], ["Taglie disponibili", "Verfügbare Größen"], ["Colore:", "Farbe:"], ["Motivo:", "Design:"], ["Materiale:", "Material:"],
    ["Lavare al rovescio", "Auf links waschen"], ["con ciclo delicato", "im Schonwaschgang"], ["a 30°C", "bei 30°C"], ["Non stirare direttamente sulla stampa", "Nicht direkt über den Druck bügeln"],
    ["seguire l'etichetta interna", "das innere Pflegeetikett beachten"], ["per proteggere", "zum Schutz von"], ["Applicazioni", "Applikationen"], ["applicazioni", "Applikationen"],
    ["Girocollo e manica corta", "Rundhalsausschnitt und kurze Ärmel"], ["Manica corta", "Kurze Ärmel"], ["Chiusura frontale con bottoni", "Vorderer Knopfverschluss"],
    ["Maxi grafica frontale", "Großes Frontmotiv"], ["Maxi stampa posteriore", "Großer Rückendruck"], ["Stampa fronte e retro", "Print auf Vorder- und Rückseite"],
    ["Vestibilità ampia", "Lockere Passform"], ["Vestibilità oversize", "Oversized-Passform"], ["Taglio ampio", "Weiter Schnitt"], ["gamba ampia", "weites Bein"],
    ["T-shirt oversize", "Oversized-T-Shirt"], ["Canotta oversize", "Oversized-Tanktop"], ["Camicia oversize", "Oversized-Hemd"], ["Felpa", "Hoodie"], ["Bermuda", "Bermudashorts"],
    ["con", "mit"], ["sul fronte", "auf der Vorderseite"], ["sul retro", "auf der Rückseite"], ["fronte", "Vorderseite"], ["retro", "Rückseite"],
    ["in cotone", "aus Baumwolle"], ["in denim", "aus Denim"], ["effetto washed", "Washed-Effekt"], ["lavaggio", "Waschung"], ["dettagli", "Details"],
    ["cristalli", "Kristalle"], ["strass", "Strass"], ["perle", "Perlen"], ["grafica", "Grafik"], ["stampa", "Print"], ["nero", "schwarz"], ["nera", "schwarz"], ["bianco", "weiß"], ["bianca", "weiß"], ["blu", "blau"], ["verde", "grün"], ["rosso", "rot"], ["rossa", "rot"],
  ],
  fr: [
    ["Vestibilità", "Coupe"], ["Taglie disponibili", "Tailles disponibles"], ["Colore:", "Couleur :"], ["Motivo:", "Motif :"], ["Materiale:", "Matière :"],
    ["Lavare al rovescio", "Laver sur l’envers"], ["con ciclo delicato", "en cycle délicat"], ["a 30°C", "à 30°C"], ["Non stirare direttamente sulla stampa", "Ne pas repasser directement sur l’imprimé"],
    ["seguire l'etichetta interna", "suivre l’étiquette intérieure"], ["per proteggere", "afin de protéger"], ["Applicazioni", "Applications"], ["applicazioni", "applications"],
    ["Girocollo e manica corta", "Col rond et manches courtes"], ["Manica corta", "Manches courtes"], ["Chiusura frontale con bottoni", "Fermeture boutonnée sur le devant"],
    ["Maxi grafica frontale", "Grand visuel sur le devant"], ["Maxi stampa posteriore", "Grand imprimé au dos"], ["Stampa fronte e retro", "Imprimé devant et dos"],
    ["Vestibilità ampia", "Coupe ample"], ["Vestibilità oversize", "Coupe oversize"], ["Taglio ampio", "Coupe large"], ["gamba ampia", "jambe large"],
    ["T-shirt oversize", "T-shirt oversize"], ["Canotta oversize", "Débardeur oversize"], ["Camicia oversize", "Chemise oversize"], ["Felpa", "Sweat"], ["Bermuda", "Bermuda"],
    ["con", "avec"], ["sul fronte", "sur le devant"], ["sul retro", "au dos"], ["fronte", "devant"], ["retro", "dos"],
    ["in cotone", "en coton"], ["in denim", "en denim"], ["effetto washed", "effet délavé"], ["lavaggio", "délavage"], ["dettagli", "détails"],
    ["cristalli", "cristaux"], ["strass", "strass"], ["perle", "perles"], ["grafica", "visuel"], ["stampa", "imprimé"], ["nero", "noir"], ["nera", "noire"], ["bianco", "blanc"], ["bianca", "blanche"], ["blu", "bleu"], ["verde", "vert"], ["rosso", "rouge"], ["rossa", "rouge"],
  ],
}

export function translateCatalogText(source: string | null | undefined, locale: Locale) {
  if (!source || locale === "it") return source || ""
  const exact = catalogExactMap.get(source.trim())
  if (exact) return exact[localeIndex[locale]]

  return catalogFragments[locale]
    .slice()
    .sort((left, right) => right[0].length - left[0].length)
    .reduce((text, [from, to]) => {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const matcher = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "giu")
      return text.replace(matcher, (_match, prefix: string) => `${prefix}${to}`)
    }, source)
}
