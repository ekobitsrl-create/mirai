-- Rimuove le dichiarazioni "pezzo unico" e "fatto a mano" dai cappelli
-- disponibili in più taglie, mantenendo il resto della descrizione.
update public.products
set description = trim(
  regexp_replace(
    description,
    '\s*Pezzo unico fatto a mano\.?\s*',
    ' Personalizzazione con applicazioni decorative e finitura premium, disponibile nelle taglie indicate.',
    'gi'
  )
)
where id in (
  '4c89683d-939d-427a-8a34-3e00f9509d1e',
  'dc89f425-f02a-44e6-9694-b8131baed774',
  '835cb227-c4f9-48db-88a2-d8a0ac021c66',
  'd7304772-f3df-4ad3-84b0-b2039f9812a1',
  'b7629ec4-34d2-428b-b0d8-ccfd9317de99'
)
and cardinality(sizes) > 1
and description ~* 'pezzo unico fatto a mano';
