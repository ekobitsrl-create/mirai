update public.categories
set
  name = 'God Street',
  slug = 't-shirt-god-street',
  description = 'T-shirt oversize God Street selezionate da MIRAI.'
where slug = 't-shirt-god-speed';

update public.products
set category = 't-shirt-god-street'
where category = 't-shirt-god-speed';
