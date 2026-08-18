begin;

update public.categories
set
  name = 'GodSpeed',
  slug = 't-shirt-godspeed',
  description = 'T-shirt oversize GodSpeed selezionate da MIRAI.'
where slug in ('t-shirt-god-street', 't-shirt-god-speed', 't-shirt-godspeed');

update public.products
set category = 't-shirt-godspeed'
where category in ('t-shirt-god-street', 't-shirt-god-speed');

update public.products
set
  name = replace(replace(replace(name, 'Good Street', 'GodSpeed'), 'God Street', 'GodSpeed'), 'God Speed', 'GodSpeed'),
  description = replace(replace(replace(description, 'Good Street', 'GodSpeed'), 'God Street', 'GodSpeed'), 'God Speed', 'GodSpeed')
where category = 't-shirt-godspeed'
  and (
    name ~* 'good[ -]?street|god[ -]?street|god[ -]?speed'
    or description ~* 'good[ -]?street|god[ -]?street|god[ -]?speed'
  );

commit;
