update public.categories
set description = case slug
  when 'jeans' then 'Jeans streetwear uomo con lavaggi washed, dettagli distressed e vestibilità rilassate.'
  when 'mirai-parfum-exlusive' then 'Fragranze MIRAI dalla firma intensa e contemporanea.'
  when 'shorts' then 'Bermuda e shorts streetwear con volumi baggy, denim lavorato e dettagli premium.'
  when 'sweatshirts' then 'Felpe e sweatshirt streetwear con vestibilità oversize e grafiche urban.'
  when 't-shirt' then 'T-shirt oversize streetwear con grafiche decise, lavaggi vintage e fit rilassato.'
  when 'tracksuits' then 'Completi e tracksuit streetwear coordinati, pensati per comfort e stile urban.'
  when 'headwear' then 'Cappelli custom New Era personalizzati artigianalmente con cristalli, perle e borchie.'
  else description
end
where slug in (
  'jeans',
  'mirai-parfum-exlusive',
  'shorts',
  'sweatshirts',
  't-shirt',
  'tracksuits',
  'headwear'
);
