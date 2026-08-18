insert into public.categories (name, slug, description, image_url, sort_order, parent_id)
values (
  'Drop',
  'drop',
  'Chrome Drop FW26/27: nuovi capi ArtSuperMoney disponibili in preordine, con uscita prevista per fine settembre 2026.',
  '/images/drop/asm-fw26/drop-cover.jpg',
  -20,
  null
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

with drop_products (
  name, description, price, image_slug, supplier_sku, color_name, color_hex,
  fit_note, detail_items, composition
) as (
  values
    (
      'ArtSuperMoney Daily T-Bar Tee',
      'T-shirt boxy nera ArtSuperMoney con logo discreto sul petto e maxi grafica T-Bar sul retro. Un capo Made in Italy costruito per volumi streetwear puliti e decisi.',
      115::numeric, 'daily-tbar-tee', 'TS-101', 'Nero', '#171717',
      'Vestibilità boxy e rilassata: scegli la tua taglia abituale.',
      array['T-shirt girocollo a manica corta', 'Logo ArtSuperMoney sul petto', 'Maxi grafica T-Bar sul retro', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney T-Bar Zip Hoodie',
      'Zip hoodie nera washed ArtSuperMoney con apertura frontale, tasche a marsupio separate e grafica T-Bar sul retro. La finitura vissuta valorizza la costruzione rilassata del capo.',
      175::numeric, 'tbar-zip-hoodie', 'ZH-101', 'Nero washed', '#252525',
      'Vestibilità rilassata: scegli la tua taglia abituale.',
      array['Felpa con cappuccio e zip integrale', 'Tasche frontali a marsupio', 'Logo sul petto e grafica T-Bar sul retro', 'Finitura washed', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Chromebirds Hoodie',
      'Hoodie nera washed ArtSuperMoney con grafica Chromebirds ad alto contrasto. Cappuccio, polsini e fondo a costine completano una silhouette streetwear ampia e strutturata.',
      159::numeric, 'chromebirds-hoodie', 'HC-101', 'Nero washed', '#242424',
      'Vestibilità oversize e rilassata: scegli la tua taglia abituale.',
      array['Felpa con cappuccio', 'Grafica Chromebirds fronte e retro', 'Polsini e fondo a costine', 'Finitura washed', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Chromebirds Longsleeve Tee',
      'T-shirt a manica lunga nera washed ArtSuperMoney con grafica Chromebirds frontale e dettagli coordinati. Il taglio rilassato la rende adatta al layering streetwear.',
      125::numeric, 'chromebirds-longsleeve', 'LS-101', 'Nero washed', '#232323',
      'Vestibilità boxy e rilassata: scegli la tua taglia abituale.',
      array['T-shirt girocollo a manica lunga', 'Grafica Chromebirds frontale', 'Dettagli grafici coordinati', 'Finitura washed', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Circle Waffle Longsleeve',
      'Longsleeve nera ArtSuperMoney in tessuto waffle con grafica Circle rossa sul fronte. La texture materica e il taglio rilassato definiscono un capo essenziale ma riconoscibile.',
      125::numeric, 'circle-waffle-longsleeve', 'WLS-101', 'Nero', '#151515',
      'Vestibilità rilassata: scegli la tua taglia abituale.',
      array['Maglia girocollo a manica lunga', 'Tessuto con struttura waffle', 'Grafica Circle frontale', 'Polsini a costine', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Crosswestern Crewneck',
      'Felpa girocollo ArtSuperMoney color grigio Iron con maxi grafica Crosswestern frontale. La costruzione pulita lascia alla stampa il ruolo di protagonista.',
      159::numeric, 'crosswestern-crewneck', 'SH-101', 'Iron', '#a5a39d',
      'Vestibilità oversize e rilassata: scegli la tua taglia abituale.',
      array['Felpa girocollo senza cappuccio', 'Maxi grafica Crosswestern frontale', 'Polsini e fondo a costine', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Crosswestern Longsleeve Tee',
      'T-shirt a manica lunga ArtSuperMoney in tonalità Mility con maxi grafica Crosswestern. Il lavaggio sfumato accompagna una silhouette boxy pensata per il layering.',
      125::numeric, 'crosswestern-longsleeve', 'LS-102', 'Mility', '#77784c',
      'Vestibilità boxy e rilassata: scegli la tua taglia abituale.',
      array['T-shirt girocollo a manica lunga', 'Maxi grafica Crosswestern frontale', 'Lavaggio sfumato', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney T-Bar Longsleeve Tee',
      'Longsleeve nera ArtSuperMoney dal design essenziale, con logo T-Bar sul petto e grafica coordinata sul retro. Una base versatile per look urban e layering.',
      125::numeric, 'tbar-longsleeve', 'LS-103', 'Nero', '#171717',
      'Vestibilità boxy e rilassata: scegli la tua taglia abituale.',
      array['T-shirt girocollo a manica lunga', 'Logo T-Bar sul petto', 'Grafica coordinata sul retro', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Grillz Paper Tee',
      'T-shirt bordeaux ArtSuperMoney con maxi grafica Grillz frontale. Il soggetto iconico e la costruzione boxy trasformano la tee in un elemento centrale del look.',
      105::numeric, 'grillz-paper-tee', 'TS-102', 'Blood', '#5a2733',
      'Vestibilità boxy e rilassata: scegli la tua taglia abituale.',
      array['T-shirt girocollo a manica corta', 'Maxi grafica Grillz frontale', 'Silhouette boxy', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Grillz Crewneck',
      'Felpa girocollo nera washed ArtSuperMoney con maxi grafica Grillz frontale. Il lavaggio vissuto e il volume rilassato rafforzano l’identità streetwear del modello.',
      149::numeric, 'grillz-crewneck', 'SH-102', 'Nero washed', '#262626',
      'Vestibilità oversize e rilassata: scegli la tua taglia abituale.',
      array['Felpa girocollo senza cappuccio', 'Maxi grafica Grillz frontale', 'Polsini e fondo a costine', 'Finitura washed', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Grillz Longsleeve Tee',
      'Longsleeve bordeaux ArtSuperMoney con maxi grafica Grillz frontale. Maniche lunghe, girocollo e taglio boxy creano un capo grafico adatto al layering.',
      125::numeric, 'grillz-longsleeve', 'LS-104', 'Blood', '#552431',
      'Vestibilità boxy e rilassata: scegli la tua taglia abituale.',
      array['T-shirt girocollo a manica lunga', 'Maxi grafica Grillz frontale', 'Silhouette boxy', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Grillz Hoodie',
      'Hoodie off-white ArtSuperMoney con maxi grafica Grillz frontale. Cappuccio, tasca a marsupio e finiture a costine completano la silhouette rilassata.',
      159::numeric, 'grillz-hoodie', 'HC102', 'Off white', '#eee9dc',
      'Vestibilità oversize e rilassata: scegli la tua taglia abituale.',
      array['Felpa con cappuccio', 'Maxi grafica Grillz frontale', 'Tasca a marsupio', 'Polsini e fondo a costine', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Rodeo Sleeveless Hoodie',
      'Hoodie smanicata ArtSuperMoney color sabbia con maxi grafica Rodeo frontale e dettaglio T-Bar sul retro. Il giromanica ampio favorisce layering e libertà di movimento.',
      139::numeric, 'rodeo-sleeveless-hoodie', 'FS001', 'Sabbia', '#ded9ca',
      'Vestibilità ampia e rilassata: scegli la tua taglia abituale.',
      array['Felpa smanicata con cappuccio', 'Maxi grafica Rodeo frontale', 'Dettaglio T-Bar sul retro', 'Giromanica ampio', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Galaxy Sleeveless Hoodie',
      'Hoodie smanicata ArtSuperMoney off-white con grafica Galaxy frontale e stampa posteriore coordinata. Il volume ampio è pensato per un layering streetwear deciso.',
      115::numeric, 'galaxy-sleeveless-hoodie', 'FS003', 'Off white', '#eeeadd',
      'Vestibilità ampia e rilassata: scegli la tua taglia abituale.',
      array['Felpa smanicata con cappuccio', 'Grafica Galaxy frontale', 'Stampa coordinata sul retro', 'Giromanica ampio', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Wide Leg Denim',
      'Jeans ArtSuperMoney in denim blu Used con gamba ampia e costruzione cinque tasche. Il lavaggio vissuto accompagna una linea rilassata e versatile.',
      139::numeric, 'wide-leg-denim', 'W001', 'Used blue', '#557385',
      'Vestibilità wide leg: scegli la tua taglia abituale.',
      array['Jeans a gamba ampia', 'Costruzione cinque tasche', 'Lavaggio Used', 'Chiusura con bottone e zip', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    ),
    (
      'ArtSuperMoney Flared Denim',
      'Jeans ArtSuperMoney in denim nero con linea flared e costruzione cinque tasche. La gamba svasata crea una silhouette netta dal carattere contemporaneo.',
      139::numeric, 'flared-denim', 'F001', 'Nero', '#111111',
      'Vestibilità flared: scegli la tua taglia abituale.',
      array['Jeans a gamba svasata', 'Costruzione cinque tasche', 'Chiusura con bottone e zip', 'Made in Italy', 'Taglie disponibili: S, M, L, XL'],
      null
    )
)
insert into public.products (
  name, description, price, category, image_url, sizes, in_stock, is_new,
  brand, supplier_profile, supplier_sku, gtin, shipping_min_days, shipping_max_days,
  color_name, color_hex, fit_note, detail_items, composition, care,
  stock_by_size, image_gallery, is_published, is_preorder, preorder_release_at, drop_name
)
select
  p.name,
  p.description,
  p.price,
  'drop',
  '/images/drop/asm-fw26/' || p.image_slug || '-front.jpg',
  array['S', 'M', 'L', 'XL'],
  true,
  true,
  'ArtSuperMoney',
  'minimal',
  p.supplier_sku,
  null,
  3,
  5,
  p.color_name,
  p.color_hex,
  p.fit_note,
  p.detail_items,
  p.composition,
  'Lavare seguendo le indicazioni riportate sull’etichetta interna del capo.',
  jsonb_build_object('S', 20, 'M', 20, 'L', 20, 'XL', 20),
  jsonb_build_array(
    jsonb_build_object('src', '/images/drop/asm-fw26/' || p.image_slug || '-front.jpg', 'alt', p.name || ' - vista frontale', 'fit', 'contain', 'position', 'center'),
    jsonb_build_object('src', '/images/drop/asm-fw26/' || p.image_slug || '-back.jpg', 'alt', p.name || ' - vista posteriore', 'fit', 'contain', 'position', 'center'),
    jsonb_build_object('src', '/images/drop/asm-fw26/' || p.image_slug || '-look.jpg', 'alt', p.name || ' - look indossato', 'fit', 'contain', 'position', 'center')
  ),
  true,
  true,
  '2026-09-30T00:00:00+02:00'::timestamptz,
  'Chrome Drop FW26/27'
from drop_products p
where not exists (
  select 1
  from public.products existing
  where upper(trim(existing.supplier_sku)) = upper(trim(p.supplier_sku))
);
