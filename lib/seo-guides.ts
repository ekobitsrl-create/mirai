export type SeoGuideSection = {
  heading: string
  paragraphs: string[]
}

import type { Locale } from "@/lib/translations"

export type SeoGuide = {
  slug: string
  title: string
  description: string
  primaryKeyword: string
  relatedKeywords: string[]
  intro: string
  sections: SeoGuideSection[]
  takeaways: string[]
  cta: { label: string; href: string }
  publishedAt: string
  updatedAt: string
}

const PUBLISHED_AT = "2026-07-21"

export const SEO_GUIDES: SeoGuide[] = [
  {
    slug: "come-veste-t-shirt-oversize",
    title: "Come veste una t-shirt oversize: guida a fit e taglia",
    description:
      "Scopri come veste una t-shirt oversize, come scegliere la taglia e quali misure controllare per ottenere il volume giusto.",
    primaryKeyword: "come veste una t-shirt oversize",
    relatedKeywords: ["come scegliere la taglia oversize", "t-shirt oversize uomo", "vestibilità oversize"],
    intro:
      "Una t-shirt oversize non è semplicemente una maglietta di una taglia più grande. Spalle, torace, maniche e lunghezza vengono progettati per creare volume senza perdere struttura. Capire queste proporzioni aiuta a scegliere meglio online e a ottenere il risultato desiderato.",
    sections: [
      {
        heading: "I segnali di un vero fit oversize",
        paragraphs: [
          "La cucitura della spalla tende a scendere oltre il punto naturale, il torace è più ampio e la manica copre una parte maggiore del braccio. La lunghezza può aumentare, ma non deve per forza farlo: alcuni modelli rimangono compatti per mantenere una forma più squadrata.",
          "Il tessuto conta quanto il taglio. Un cotone più consistente sostiene il volume; un jersey leggero cade maggiormente sul corpo e produce un effetto più morbido.",
        ],
      },
      {
        heading: "Come scegliere la taglia oversize",
        paragraphs: [
          "Se la scheda indica che il capo è già oversize, parti dalla tua taglia abituale. Scegliere automaticamente una taglia in più può alterare troppo lunghezza e giro manica. Confronta larghezza torace e lunghezza con una t-shirt che possiedi e che ti veste bene.",
          "Se preferisci un risultato più pulito valuta una taglia in meno, ma solo dopo aver verificato le misure del prodotto. Il nome del fit è un'indicazione; la tabella taglie resta il riferimento più preciso.",
        ],
      },
      {
        heading: "Equilibrare il resto dell'outfit",
        paragraphs: [
          "Una tee ampia funziona con pantaloni dritti, denim rilassati o bermuda larghi. Per creare contrasto puoi abbinarla a un fondo più asciutto, mentre volumi coerenti sopra e sotto costruiscono una silhouette streetwear più marcata.",
        ],
      },
    ],
    takeaways: [
      "Controlla spalle, larghezza torace e lunghezza.",
      "Parti dalla taglia abituale se il capo nasce già oversize.",
      "Usa un tuo capo come riferimento per confrontare le misure.",
    ],
    cta: { label: "Scopri le t-shirt oversize", href: "/collezione/t-shirt" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "differenza-fit-oversize-boxy",
    title: "Differenza tra fit oversize e boxy",
    description:
      "Oversize o boxy? Scopri le differenze tra i due fit, come cambiano le proporzioni e quale scegliere per il tuo outfit streetwear.",
    primaryKeyword: "differenza tra fit oversize e boxy",
    relatedKeywords: ["t-shirt boxy fit uomo", "fit oversize", "maglietta boxy"],
    intro:
      "Oversize e boxy descrivono due modi diversi di costruire il volume. Possono convivere nello stesso capo, ma non sono sinonimi: riconoscere la differenza rende più semplice leggere una scheda prodotto e immaginare la vestibilità.",
    sections: [
      {
        heading: "Fit oversize: più spazio e caduta rilassata",
        paragraphs: [
          "L'oversize amplia le misure tradizionali, soprattutto su spalle, torace e maniche. Il capo può essere anche più lungo e crea una linea morbida che segue il movimento del corpo.",
          "È il fit adatto a chi cerca layering, comfort e una presenza visiva evidente. Tessuto e grammatura decidono se il volume rimane strutturato oppure cade in modo fluido.",
        ],
      },
      {
        heading: "Fit boxy: largo, ma più corto e geometrico",
        paragraphs: [
          "Il boxy fit privilegia una forma quasi quadrata: torace ampio, spalle scese e lunghezza contenuta. Il bordo inferiore si ferma più in alto rispetto a molte tee oversize e rende visibile la proporzione del pantalone.",
          "Per questo una boxy tee funziona bene con pantaloni a vita media o alta, denim larghi e bermuda strutturati.",
        ],
      },
      {
        heading: "Quale scegliere",
        paragraphs: [
          "Scegli oversize se vuoi una linea lunga e rilassata o se costruisci più strati. Scegli boxy se preferisci un busto compatto e una silhouette netta. Se il capo è boxy oversize, aspettati larghezza importante ma lunghezza controllata.",
        ],
      },
    ],
    takeaways: [
      "Oversize indica soprattutto volume generale.",
      "Boxy indica larghezza con lunghezza più compatta.",
      "Le misure reali contano più dell'etichetta usata per il fit.",
    ],
    cta: { label: "Confronta i fit MIRAI", href: "/collezione/t-shirt" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "come-creare-outfit-streetwear-uomo",
    title: "Come creare un outfit streetwear uomo",
    description:
      "Una guida pratica per creare outfit streetwear uomo, abbinare t-shirt oversize e costruire look urban equilibrati anche in estate.",
    primaryKeyword: "come creare un outfit streetwear uomo",
    relatedKeywords: ["come abbinare una t-shirt oversize", "idee outfit streetwear estate", "abbigliamento urban uomo"],
    intro:
      "Un outfit streetwear efficace nasce da proporzioni intenzionali, non dall'accumulo di capi vistosi. Parti da un elemento principale, scegli una palette limitata e usa accessori e layering per aggiungere personalità.",
    sections: [
      {
        heading: "Parti dalla silhouette",
        paragraphs: [
          "Decidi prima il rapporto tra parte superiore e inferiore. Una t-shirt oversize può essere bilanciata da denim dritti, pantaloni cargo o bermuda ampi. Una boxy tee, più corta, mette invece in evidenza la vita e il volume del pantalone.",
          "Ripetere un volume in due punti del look crea coerenza; alternare ampio e asciutto produce contrasto. Entrambe le strade funzionano se la scelta è leggibile.",
        ],
      },
      {
        heading: "Come abbinare una t-shirt oversize",
        paragraphs: [
          "Usa una tee grafica come punto focale e mantieni neutri pantaloni e scarpe, oppure scegli una t-shirt tinta unita per lasciare spazio a un cappello custom o a una camicia aperta. Evita che tutti gli elementi abbiano lo stesso peso visivo.",
          "Per il layering lascia intravedere differenze di lunghezza e texture. Una camicia oversize aperta sopra la tee aggiunge profondità senza appesantire.",
        ],
      },
      {
        heading: "Idee per outfit streetwear estivi",
        paragraphs: [
          "In estate lavora con meno strati e più attenzione ai materiali. Abbina t-shirt in cotone, bermuda rilassati e sneaker pulite; completa con un cappello che riprenda uno dei colori della grafica. La sera puoi aggiungere una camicia leggera portata aperta.",
        ],
      },
    ],
    takeaways: [
      "Scegli un solo elemento protagonista.",
      "Limita la palette a pochi colori coerenti.",
      "Bilancia i volumi prima di aggiungere gli accessori.",
    ],
    cta: { label: "Esplora l'abbigliamento urban", href: "/collezioni" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "cotone-pesante-t-shirt",
    title: "Cotone pesante nelle t-shirt: cosa significa",
    description:
      "Cosa significa cotone pesante per una t-shirt? Grammatura, struttura, comfort e differenze rispetto a un jersey leggero.",
    primaryKeyword: "cotone pesante t-shirt cosa significa",
    relatedKeywords: ["t-shirt cotone pesante streetwear", "heavy tee", "grammatura t-shirt"],
    intro:
      "Quando una t-shirt viene definita heavy o in cotone pesante si parla soprattutto della quantità di tessuto per metro quadrato. La grammatura influenza struttura e sensazione al tatto, ma da sola non basta a descrivere la qualità del capo.",
    sections: [
      {
        heading: "Che cos'è la grammatura",
        paragraphs: [
          "La grammatura è espressa in grammi per metro quadrato. Un valore più alto indica in genere un jersey più consistente, capace di mantenere meglio la forma. Filato, lavorazione, finissaggio e cuciture restano però altrettanto importanti.",
          "Due t-shirt con la stessa grammatura possono quindi avere mano e vestibilità diverse. Per questo è utile leggere insieme composizione, fit e indicazioni di cura.",
        ],
      },
      {
        heading: "Perché è usato nello streetwear",
        paragraphs: [
          "Un tessuto sostenuto valorizza tagli oversize e boxy perché rende più visibili spalle e volume del torace. Offre inoltre una base stabile per molte grafiche stampate.",
          "Il rovescio della medaglia è una sensazione più calda e compatta: nei mesi estivi conta valutare anche traspirabilità e ampiezza del capo.",
        ],
      },
      {
        heading: "Come scegliere",
        paragraphs: [
          "Preferisci il cotone pesante se cerchi struttura, coprenza e una silhouette decisa. Un jersey più leggero è adatto a una caduta morbida o al layering. Non esiste una scelta migliore in assoluto: dipende dall'effetto che vuoi ottenere.",
        ],
      },
    ],
    takeaways: [
      "La grammatura misura il peso del tessuto, non tutta la qualità.",
      "Il cotone pesante sostiene meglio i fit boxy e oversize.",
      "Composizione, cuciture e finissaggio completano la valutazione.",
    ],
    cta: { label: "Scopri le heavy tee", href: "/collezione/t-shirt" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "come-abbinare-bermuda-streetwear",
    title: "Come abbinare i bermuda streetwear",
    description:
      "Scopri come abbinare bermuda streetwear uomo e shorts oversize con t-shirt, camicie, sneaker e accessori.",
    primaryKeyword: "come abbinare bermuda streetwear",
    relatedKeywords: ["bermuda streetwear uomo", "shorts streetwear uomo", "bermuda oversize uomo"],
    intro:
      "I bermuda streetwear definiscono gran parte della silhouette estiva. Lunghezza, ampiezza della gamba e altezza della vita determinano l'equilibrio con t-shirt, camicie e sneaker.",
    sections: [
      {
        heading: "Trova la proporzione giusta",
        paragraphs: [
          "Un bermuda ampio sotto il ginocchio crea una base importante e funziona con tee boxy o oversize. Se il modello è più corto o asciutto puoi aumentare il volume della parte superiore per costruire contrasto.",
          "Controlla dove termina l'orlo rispetto al ginocchio: pochi centimetri cambiano molto la percezione della gamba e delle calzature.",
        ],
      },
      {
        heading: "T-shirt, camicie e layering",
        paragraphs: [
          "Con una t-shirt grafica mantieni il bermuda neutro; con shorts tecnici o ricchi di tasche usa un top più essenziale. Una camicia oversize aperta aggiunge uno strato leggero e accompagna la linea verticale del look.",
        ],
      },
      {
        heading: "Scarpe e accessori",
        paragraphs: [
          "Sneaker voluminose sostengono bermuda larghi, mentre linee più pulite alleggeriscono l'insieme. Calze, cappello e borsa dovrebbero riprendere uno o due colori già presenti, senza introdurre troppi nuovi punti focali.",
        ],
      },
    ],
    takeaways: [
      "Valuta lunghezza e ampiezza insieme.",
      "Bilancia il peso visivo tra top e parte inferiore.",
      "Ripeti i colori negli accessori con moderazione.",
    ],
    cta: { label: "Scopri bermuda e pantaloni", href: "/collezione/pantaloni" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "come-personalizzare-t-shirt",
    title: "Come personalizzare una t-shirt online",
    description:
      "Come personalizzare una t-shirt online con foto, scritta o grafica: formato del file, posizione e controlli prima della stampa.",
    primaryKeyword: "come personalizzare una t-shirt",
    relatedKeywords: ["maglietta personalizzata con foto", "maglietta personalizzata con scritta", "personalizzare t-shirt online"],
    intro:
      "Una t-shirt personalizzata riuscita parte da un'idea leggibile e da un file adatto alla stampa. Nel MIRAI Custom Lab puoi scegliere capo, colore, lato e grafica, vedere un'anteprima e inviare il progetto al controllo del team.",
    sections: [
      {
        heading: "Prepara foto, scritta o grafica",
        paragraphs: [
          "Usa un'immagine nitida e, quando possibile, con sfondo trasparente. Evita screenshot piccoli o file già compressi molte volte: ingranditi sulla t-shirt possono perdere dettaglio.",
          "Per una scritta controlla ortografia, maiuscole e spaziatura. Una frase breve resta leggibile anche da lontano; un testo lungo richiede dimensioni più piccole e cambia il peso della composizione.",
        ],
      },
      {
        heading: "Dimensione e posizione",
        paragraphs: [
          "Valuta la grafica in rapporto al capo, non soltanto allo schermo. Una stampa centrale ampia produce un risultato deciso; un elemento piccolo sul petto è più discreto. Sul retro puoi usare formati più grandi senza affollare il fronte.",
          "Mantieni margine da collo, cuciture e bordi. L'anteprima è utile per comporre, mentre il controllo umano verifica fattibilità e qualità prima della produzione.",
        ],
      },
      {
        heading: "Prima di confermare",
        paragraphs: [
          "Rileggi il testo, verifica contrasto tra grafica e colore della t-shirt e scegli la taglia consultando la vestibilità. Conserva il file originale: potrà servire se il team deve chiedere una versione migliore.",
        ],
      },
    ],
    takeaways: [
      "Parti da un file nitido e poco compresso.",
      "Controlla contrasto, margini e leggibilità.",
      "Rivedi testo e taglia prima di inviare il progetto.",
    ],
    cta: { label: "Crea la tua t-shirt online", href: "/custom-lab" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "come-lavare-t-shirt-stampata",
    title: "Come lavare una t-shirt stampata",
    description:
      "Guida pratica per lavare una t-shirt stampata: temperatura, rovescio, asciugatura e stiratura per proteggere grafica e tessuto.",
    primaryKeyword: "come lavare una t-shirt stampata",
    relatedKeywords: ["lavaggio maglietta personalizzata", "cura t-shirt stampata", "come stirare t-shirt stampata"],
    intro:
      "Calore, sfregamento e prodotti aggressivi sono i principali nemici di una stampa. L'etichetta del capo viene sempre prima delle regole generali, ma alcune abitudini aiutano a preservare colore, forma e grafica più a lungo.",
    sections: [
      {
        heading: "Prima del lavaggio",
        paragraphs: [
          "Gira la t-shirt al rovescio, separa colori chiari e scuri e chiudi eventuali zip di altri capi che potrebbero sfregare la stampa. Se c'è una macchia, evita di strofinare con forza direttamente sulla grafica.",
        ],
      },
      {
        heading: "Temperatura e ciclo",
        paragraphs: [
          "Segui la temperatura indicata in etichetta e preferisci un ciclo delicato. Un detersivo non aggressivo e una centrifuga moderata riducono stress su fibra e stampa. La candeggina può scolorire sia il tessuto sia la grafica.",
          "Non sovraccaricare il cestello: lasciare spazio ai capi limita pieghe e attrito eccessivo.",
        ],
      },
      {
        heading: "Asciugatura e stiratura",
        paragraphs: [
          "Quando l'etichetta lo consente, asciuga all'aria e lontano da fonti di calore diretto. Stira la t-shirt al rovescio e non appoggiare il ferro sulla stampa; in alternativa usa un panno protettivo e una temperatura compatibile con il tessuto.",
        ],
      },
    ],
    takeaways: [
      "Lava e stira il capo al rovescio.",
      "Segui sempre l'etichetta specifica del prodotto.",
      "Riduci calore, sfregamento e detergenti aggressivi.",
    ],
    cta: { label: "Scopri il MIRAI Custom Lab", href: "/custom-lab" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "cappelli-custom-come-vengono-realizzati",
    title: "Cappelli custom: come vengono realizzati",
    description:
      "Come vengono realizzati i cappelli custom con cristalli, strass e applicazioni: concept, composizione e cura del pezzo.",
    primaryKeyword: "cappelli custom come vengono realizzati",
    relatedKeywords: ["cappelli custom con cristalli", "cappelli con strass", "cappelli personalizzati premium"],
    intro:
      "La customizzazione di un cappello parte dalla sua forma. Visiera, pannelli, logo e cuciture definiscono le aree su cui intervenire; cristalli, strass e applicazioni devono valorizzare il modello senza nasconderne l'identità.",
    sections: [
      {
        heading: "Dal concept alla composizione",
        paragraphs: [
          "Prima dell'applicazione si definiscono ritmo, densità e punti focali. Una composizione simmetrica comunica precisione, mentre una distribuzione irregolare crea un effetto più spontaneo. Colore e riflesso dei dettagli vanno valutati insieme al tessuto del cappello.",
        ],
      },
      {
        heading: "Applicazioni e controllo",
        paragraphs: [
          "La superficie curva richiede attenzione a distanze e allineamento. Dopo l'applicazione, il pezzo viene controllato da più angolazioni per verificare continuità del disegno e stabilità visiva.",
          "Ogni tecnica e materiale può richiedere cure diverse; le indicazioni fornite con il prodotto sono quindi il riferimento corretto.",
        ],
      },
      {
        heading: "Come conservare un cappello custom",
        paragraphs: [
          "Evita di schiacciare la corona, riponi il cappello al riparo da polvere e umidità e non strofinare le applicazioni. Per la pulizia intervieni in modo localizzato e delicato, seguendo le istruzioni specifiche del modello.",
        ],
      },
    ],
    takeaways: [
      "Il design segue forma e pannelli del cappello.",
      "Densità e posizione dei dettagli cambiano il risultato.",
      "Conservazione e pulizia delicata proteggono le applicazioni.",
    ],
    cta: { label: "Scopri i cappelli custom", href: "/collezione/cappelli" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
  {
    slug: "streetwear-artigianale-vs-fast-fashion",
    title: "Streetwear artigianale vs fast fashion",
    description:
      "Streetwear artigianale e fast fashion a confronto: differenze in design, produzione, quantità, prezzo e rapporto con il capo.",
    primaryKeyword: "streetwear artigianale vs fast fashion",
    relatedKeywords: ["t-shirt custom premium", "streetwear premium online", "concept store streetwear"],
    intro:
      "Streetwear artigianale e fast fashion rispondono a logiche diverse. Il confronto non riguarda soltanto il prezzo: cambiano scala produttiva, possibilità di personalizzazione, frequenza delle collezioni e modo in cui un capo viene scelto e mantenuto.",
    sections: [
      {
        heading: "Scala e identità del prodotto",
        paragraphs: [
          "La fast fashion lavora su grandi volumi e ricambio rapido. I progetti artigianali o indipendenti tendono a sviluppare quantità più contenute, interventi manuali o drop con un'identità specifica. Questo può rendere meno uniforme il risultato, ma anche più riconoscibile ogni pezzo.",
        ],
      },
      {
        heading: "Prezzo e valore d'uso",
        paragraphs: [
          "Un prezzo superiore può riflettere materiali, tempi, lavorazioni e scala, ma non è da solo una garanzia. Controlla composizione, costruzione, informazioni sul fit e trasparenza del brand. Il valore reale dipende anche da quanto userai il capo e da come lo conserverai.",
        ],
      },
      {
        heading: "Come scegliere in modo più consapevole",
        paragraphs: [
          "Chiediti se il capo completa ciò che possiedi, se la vestibilità è adatta e se il design resterà significativo per te. Acquistare meno pezzi ma più coerenti con il proprio stile riduce gli errori indipendentemente dal segmento di prezzo.",
        ],
      },
    ],
    takeaways: [
      "Confronta materiali e costruzione, non solo il prezzo.",
      "Valuta quanto userai davvero il capo.",
      "Personalizzazione e piccola scala possono aumentare unicità e tempi di lavoro.",
    ],
    cta: { label: "Conosci il concept MIRAI", href: "/chi-siamo" },
    publishedAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
  },
]

type LocalizedGuideText = Pick<SeoGuide, "title" | "description" | "intro" | "sections" | "takeaways" | "cta">

const guideTranslations: Partial<Record<string, Record<Exclude<Locale, "it">, LocalizedGuideText>>> = {
  "come-veste-t-shirt-oversize": {
    en: { title: "How an oversized T-shirt fits: fit and size guide", description: "Learn how an oversized T-shirt should fit, how to choose your size and which measurements create the right volume.", intro: "An oversized T-shirt is not simply a regular tee in a larger size. The shoulders, chest, sleeves and length are designed to create volume without losing structure. Understanding these proportions makes online sizing easier.", sections: [{ heading: "Signs of a true oversized fit", paragraphs: ["The shoulder seam usually falls beyond the natural shoulder, the chest is wider and the sleeve covers more of the arm. Some styles stay compact in length to keep a squarer shape.", "Fabric matters as much as cut. Heavier cotton holds volume, while lighter jersey falls closer to the body."] }, { heading: "How to choose your oversized size", paragraphs: ["If the product is already designed as oversized, start with your usual size. Going up automatically can add too much length and sleeve volume. Compare the chest width and length with a T-shirt you already like.", "For a cleaner result, consider one size down only after checking the measurements. The size chart is more precise than the fit label alone."] }, { heading: "Balance the rest of the outfit", paragraphs: ["A wide tee works with straight trousers, relaxed denim or loose shorts. A slimmer bottom creates contrast, while consistent volume above and below builds a stronger streetwear silhouette."] }], takeaways: ["Check shoulders, chest width and length.", "Start with your usual size when the garment is already oversized.", "Compare measurements with a garment you own."], cta: { label: "Discover oversized T-shirts", href: "/collezione/t-shirt" } },
    es: { title: "Cómo queda una camiseta oversize: guía de corte y talla", description: "Descubre cómo debe quedar una camiseta oversize, cómo elegir la talla y qué medidas crean el volumen adecuado.", intro: "Una camiseta oversize no es simplemente una camiseta normal de una talla mayor. Hombros, pecho, mangas y largo se diseñan para crear volumen sin perder estructura. Entender estas proporciones facilita la elección online.", sections: [{ heading: "Señales de un auténtico corte oversize", paragraphs: ["La costura del hombro suele caer más allá del punto natural, el pecho es más amplio y la manga cubre una mayor parte del brazo. Algunos modelos mantienen un largo compacto para conservar una forma más cuadrada.", "El tejido importa tanto como el corte. Un algodón consistente sostiene el volumen; un jersey ligero cae más sobre el cuerpo."] }, { heading: "Cómo elegir la talla oversize", paragraphs: ["Si la prenda ya es oversize, empieza por tu talla habitual. Subir automáticamente una talla puede añadir demasiado largo y volumen de manga. Compara ancho de pecho y largo con una camiseta que ya te quede bien.", "Para un resultado más limpio, valora una talla menos solo después de revisar las medidas. La tabla de tallas es más precisa que la etiqueta del corte."] }, { heading: "Equilibra el resto del look", paragraphs: ["Una camiseta amplia funciona con pantalones rectos, denim relajado o bermudas anchas. Un fondo más ajustado crea contraste; volúmenes coherentes arriba y abajo crean una silueta streetwear más marcada."] }], takeaways: ["Comprueba hombros, ancho de pecho y largo.", "Empieza por tu talla habitual si la prenda ya es oversize.", "Compara las medidas con una prenda que ya tengas."], cta: { label: "Descubrir camisetas oversize", href: "/collezione/t-shirt" } },
    de: { title: "So sitzt ein Oversized-T-Shirt: Fit- und Größen-Guide", description: "Erfahre, wie ein Oversized-T-Shirt sitzen sollte, wie du die Größe wählst und welche Maße für das richtige Volumen sorgen.", intro: "Ein Oversized-T-Shirt ist nicht einfach ein normales Shirt in einer größeren Größe. Schultern, Brust, Ärmel und Länge werden so konstruiert, dass Volumen ohne Strukturverlust entsteht. Diese Proportionen erleichtern die Online-Auswahl.", sections: [{ heading: "Merkmale eines echten Oversized-Fits", paragraphs: ["Die Schulternaht liegt meist außerhalb der natürlichen Schulter, die Brust ist weiter und der Ärmel bedeckt mehr vom Arm. Manche Modelle bleiben kürzer, um eine quadratischere Form zu bewahren.", "Der Stoff ist so wichtig wie der Schnitt. Fester Baumwollstoff hält das Volumen, leichter Jersey fällt näher am Körper."] }, { heading: "Die richtige Oversized-Größe wählen", paragraphs: ["Wenn das Piece bereits oversized geschnitten ist, starte mit deiner üblichen Größe. Automatisches Upsizing kann zu viel Länge und Ärmelvolumen erzeugen. Vergleiche Brustweite und Länge mit einem T-Shirt, das gut sitzt.", "Für einen saubereren Look kannst du nach Prüfung der Maße eine Größe kleiner wählen. Die Größentabelle ist präziser als die Fit-Bezeichnung allein."] }, { heading: "Das restliche Outfit ausbalancieren", paragraphs: ["Ein weites T-Shirt passt zu geraden Hosen, lockerem Denim oder weiten Shorts. Ein schmalerer Unterteil schafft Kontrast; einheitliche Volumen erzeugen eine markantere Streetwear-Silhouette."] }], takeaways: ["Schultern, Brustweite und Länge prüfen.", "Bei bereits oversized geschnittenen Pieces mit der üblichen Größe starten.", "Maße mit einem eigenen Kleidungsstück vergleichen."], cta: { label: "Oversized-T-Shirts entdecken", href: "/collezione/t-shirt" } },
    fr: { title: "Comment taille un T-shirt oversize : guide coupe et taille", description: "Découvrez comment doit tomber un T-shirt oversize, comment choisir la taille et quelles mesures créent le bon volume.", intro: "Un T-shirt oversize n’est pas simplement un T-shirt classique dans une taille supérieure. Épaules, poitrine, manches et longueur sont conçues pour créer du volume sans perdre la structure. Comprendre ces proportions facilite le choix en ligne.", sections: [{ heading: "Les signes d’une vraie coupe oversize", paragraphs: ["La couture d’épaule dépasse généralement l’épaule naturelle, la poitrine est plus large et la manche couvre davantage le bras. Certains modèles restent compacts en longueur pour conserver une forme plus carrée.", "La matière compte autant que la coupe. Un coton dense soutient le volume, tandis qu’un jersey léger tombe davantage sur le corps."] }, { heading: "Choisir sa taille oversize", paragraphs: ["Si le vêtement est déjà conçu en oversize, commencez par votre taille habituelle. Monter automatiquement d’une taille peut ajouter trop de longueur et de volume aux manches. Comparez largeur de poitrine et longueur avec un T-shirt qui vous va bien.", "Pour un résultat plus net, envisagez une taille en dessous uniquement après avoir vérifié les mesures. Le guide des tailles est plus précis que le nom de la coupe."] }, { heading: "Équilibrer le reste du look", paragraphs: ["Un T-shirt ample fonctionne avec un pantalon droit, un jean décontracté ou un bermuda large. Un bas plus ajusté crée du contraste ; des volumes cohérents composent une silhouette streetwear plus affirmée."] }], takeaways: ["Vérifiez les épaules, la largeur de poitrine et la longueur.", "Commencez par votre taille habituelle si le vêtement est déjà oversize.", "Comparez les mesures avec un vêtement que vous possédez."], cta: { label: "Découvrir les T-shirts oversize", href: "/collezione/t-shirt" } },
  },
}

const genericGuideLabels: Record<Exclude<Locale, "it">, { cta: string }> = {
  en: { cta: "Explore MIRAI" },
  es: { cta: "Descubre MIRAI" },
  de: { cta: "MIRAI entdecken" },
  fr: { cta: "Découvrir MIRAI" },
}

function genericGuideTranslation(guide: SeoGuide, locale: Exclude<Locale, "it">): SeoGuide {
  const names = {
    en: { title: "MIRAI streetwear guide", description: "A practical MIRAI guide to streetwear fits, materials, styling and garment care.", intro: "This MIRAI guide explains the essential points clearly, helping you make better choices and build a personal streetwear style.", section: "Practical advice", paragraph: "Use product measurements, material information and care instructions as your main reference. Balance proportions and details according to the result you want to achieve.", takeaway: "Check each product page for fit, material and care information." },
    es: { title: "Guía streetwear MIRAI", description: "Una guía práctica MIRAI sobre cortes, materiales, combinaciones y cuidado de las prendas.", intro: "Esta guía MIRAI explica los puntos esenciales de forma clara para ayudarte a elegir mejor y construir un estilo streetwear personal.", section: "Consejos prácticos", paragraph: "Utiliza como referencia principal las medidas, la información de materiales y las instrucciones de cuidado. Equilibra proporciones y detalles según el resultado que quieras conseguir.", takeaway: "Consulta en cada ficha el corte, los materiales y el cuidado." },
    de: { title: "MIRAI Streetwear-Guide", description: "Ein praktischer MIRAI Guide zu Fits, Materialien, Styling und Pflege.", intro: "Dieser MIRAI Guide erklärt die wichtigsten Punkte klar und hilft dir, besser auszuwählen und einen persönlichen Streetwear-Stil aufzubauen.", section: "Praktische Tipps", paragraph: "Nutze Produktmaße, Materialangaben und Pflegehinweise als wichtigste Referenz. Stimme Proportionen und Details auf das gewünschte Ergebnis ab.", takeaway: "Fit, Material und Pflege auf jeder Produktseite prüfen." },
    fr: { title: "Guide streetwear MIRAI", description: "Un guide pratique MIRAI sur les coupes, les matières, le styling et l’entretien.", intro: "Ce guide MIRAI explique clairement les points essentiels afin de vous aider à mieux choisir et à construire un style streetwear personnel.", section: "Conseils pratiques", paragraph: "Utilisez en priorité les mesures, les informations sur les matières et les conseils d’entretien. Équilibrez volumes et détails selon le résultat recherché.", takeaway: "Consultez la coupe, les matières et l’entretien sur chaque fiche produit." },
  }[locale]
  return { ...guide, title: names.title, description: names.description, primaryKeyword: names.title, relatedKeywords: [], intro: names.intro, sections: [{ heading: names.section, paragraphs: [names.paragraph] }], takeaways: [names.takeaway], cta: { ...guide.cta, label: genericGuideLabels[locale].cta } }
}

export function localizeSeoGuide(guide: SeoGuide, locale: Locale): SeoGuide {
  if (locale === "it") return guide
  const translated = guideTranslations[guide.slug]?.[locale]
  return translated ? { ...guide, ...translated, primaryKeyword: translated.title, relatedKeywords: [] } : genericGuideTranslation(guide, locale)
}

export function getSeoGuide(slug: string) {
  return SEO_GUIDES.find((guide) => guide.slug === slug)
}
