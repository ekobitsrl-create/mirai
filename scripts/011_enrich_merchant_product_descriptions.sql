begin;

with merchant_details(id, material, pattern) as (
  values
    ('fbf65b40-6525-4df2-a99f-2528494c2529'::uuid, 'Cotone', 'Grafica Liberty Dreams pop vintage'),
    ('8f21753c-398d-476e-9368-e073757ae61b'::uuid, 'Cotone', 'Aquila e fiamme'),
    ('bab445f7-b80d-43b2-afc8-e956b6f53e43'::uuid, 'Cotone', 'Cherubini, ali e dettagli botanici'),
    ('aa2f6597-8e6a-42f9-bf7d-d0c9e9fa0941'::uuid, 'Cotone', 'Tigre e lettering college'),
    ('8b048175-c7be-4453-be13-8af904aca0bb'::uuid, 'Cotone', 'Croci colorate e finitura distressed'),
    ('cb222a4a-2c30-4db1-ad74-b5272fdda4ca'::uuid, 'Cotone', 'Grafica fotografica e lettering varsity'),
    ('394f274a-154c-4e49-8879-4a324d5e46d9'::uuid, 'Cotone', 'Grafica cinematografica fronte-retro'),
    ('8d73cad5-9430-4fcf-be71-be9f6afeffe5'::uuid, 'Denim', 'Strass e perle'),
    ('276c01ab-f998-44aa-9a04-fb670e5eae2e'::uuid, 'Cotone', 'Angelo in preghiera tono su tono'),
    ('ce52d2c3-1af9-41cd-a5f0-8ffba58346d3'::uuid, 'Cotone', 'Croci colorate e finitura distressed'),
    ('a3d4be08-4844-4161-9b0a-360bc690c190'::uuid, 'Cotone', 'Bulldog atletico e lettering college'),
    ('7dd2000f-e4c8-4ccf-8def-05ed9a62c746'::uuid, 'Cotone', 'Angelo in preghiera e dettagli pittorici'),
    ('9bb311af-202a-4a9c-ae3f-3c4217aa5faa'::uuid, 'Cotone', 'Elementi meccanici e lettering geometrico'),
    ('35d2db43-37ad-4ccf-9a41-8d136012f6b5'::uuid, 'Cotone', 'Statua della Libertà fronte-retro'),
    ('a046825d-9bc6-4120-a856-7bc9b447951e'::uuid, 'Cotone', 'Bulldog, basket e lettering college'),
    ('d00202be-02c4-43c4-bb9b-297838975812'::uuid, 'Cotone', 'Volto monocromatico, croce e lettering gotico'),
    ('824c2ce3-95d1-4e52-8455-f681379c4071'::uuid, 'Cotone', 'Corona, occhio e dadi'),
    ('9f908049-d037-4f4c-9ab7-a29e362be66f'::uuid, 'Cotone', 'Grafica Jamaica Crew fronte-retro'),
    ('35598458-52c1-44ef-9ea5-daa1cae989d4'::uuid, 'Cotone', 'Bersaglio e lettering tipografico'),
    ('1c2cf36e-7b55-44ba-bbea-293af474805a'::uuid, 'Cotone', 'Angelo a cavallo'),
    ('5f7bfa19-e7c7-4626-9cef-448d7fa6525d'::uuid, 'Cotone', 'Cupido bendato e lettering argentato'),
    ('9ee8e00d-08be-4523-b02e-e617c84c38d5'::uuid, 'Cotone', 'Lettering Santa Madre e applicazioni metalliche'),
    ('ebedaaba-e3dd-4e48-9a84-0db4abd00e0b'::uuid, 'Cotone', 'Cupido bendato e lettering brillante'),
    ('9a4a0d6a-3f67-44a1-a0ac-fdea7a2d1046'::uuid, 'Cotone', 'Illustrazione spaziale retro-futuristica'),
    ('81949812-b120-4711-bdc8-6cefae2c19e3'::uuid, 'Cotone', 'Bandiera giamaicana e silhouette'),
    ('2e791fa1-8b02-47b2-b360-554a34359875'::uuid, 'Cotone', 'Scheletro e fulmini blu elettrico'),
    ('14add6ad-4174-44ce-8a6d-7bdaa3f289e3'::uuid, 'Cotone', 'Auto sportive e grafica racing fronte-retro'),
    ('82baf709-efd7-48ac-ad36-cf47fed2cf73'::uuid, 'Cotone', 'Pantera blu elettrico e lettering oversize'),
    ('ada8b320-be31-426c-b47f-91c74951e23e'::uuid, 'Cotone', 'Madonna e finitura distressed'),
    ('17973586-ba02-4ccf-8c2a-342ce8fdf185'::uuid, 'Cotone', 'Croce a pennellata e lettering destrutturato'),
    ('1b97e5e9-50b6-4fff-9bfc-d812baca722c'::uuid, 'Tessuto camouflage', 'Camouflage woodland con cristalli'),
    ('900e3e9e-b29f-4517-b09d-fce6999d006a'::uuid, 'Cotone', 'Grafica angelica vintage fronte-retro'),
    ('0b9f8b18-750d-4004-9293-518f1c50f3fa'::uuid, 'Cotone', 'Illustrazione spaziale retro-futuristica'),
    ('4916f3a1-5152-4b8b-8d11-f63c339e9ca1'::uuid, 'Cotone', 'Auto sportive, fiamme e grafica arcade'),
    ('fe9b57ee-774f-491c-a379-d11c331115a0'::uuid, 'Cotone', 'Scena basket e playground multicolore')
)
update products as product
set
  composition = merchant_details.material,
  description = concat(
    trim(regexp_replace(coalesce(product.description, ''), '\s+Colore:\s.*$', '', 'i')),
    ' Colore: ', product.color_name,
    '. Motivo: ', merchant_details.pattern,
    '. Materiale: ', merchant_details.material,
    '.'
  ),
  updated_at = now()
from merchant_details
where product.id = merchant_details.id;

commit;
