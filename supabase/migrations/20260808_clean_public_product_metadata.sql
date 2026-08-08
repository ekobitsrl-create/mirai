-- Remove internal drafting notes from public product data and align visible
-- catalogue metadata with the actual products.

update public.products
set
  color_name = 'Blu denim Light Rinse',
  color_hex = '#526A73',
  detail_items = array[
    'Ricamo frontale multicolor',
    'Applicazioni in strass e cristalli',
    'Chiusura con bottone e coulisse',
    'Passanti per cintura',
    'Costruzione cinque tasche',
    'Gamba ampia con lunghezza al ginocchio'
  ]::text[],
  fit_note = 'Vestibilità relaxed con gamba ampia. Per un fit meno oversize, valuta una taglia in meno.',
  composition = 'Denim stone-washed con lavaggio Light Rinse.',
  care = 'Lavare al rovescio con ciclo delicato e acqua fredda. Non candeggiare. Non utilizzare l''asciugatrice. Seguire le indicazioni riportate sull''etichetta interna.',
  updated_at = now()
where id = '8df93bb2-268e-45ae-b4fd-694de9cd27e1';

-- Two pre-existing catalogue entries had their public category swapped.
update public.products
set category = 'canotte', updated_at = now()
where id = '824c2ce3-95d1-4e52-8455-f681379c4071'
  and category = 't-shirt';

update public.products
set category = 't-shirt', updated_at = now()
where id = '17973586-ba02-4ccf-8c2a-342ce8fdf185'
  and category = 'canotte';
