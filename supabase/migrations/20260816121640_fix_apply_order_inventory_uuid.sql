create or replace function public.apply_order_inventory(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $function$
declare
  order_was_adjusted boolean;
  order_item record;
  product_stock jsonb;
  next_stock jsonb;
  current_quantity integer;
begin
  select inventory_adjusted into order_was_adjusted
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Ordine % non trovato', p_order_id;
  end if;

  if order_was_adjusted then
    return false;
  end if;

  for order_item in
    select product_id, size, sum(quantity)::integer as quantity
    from public.order_items
    where order_id = p_order_id
      and product_id is not null
      and size is not null
    group by product_id, size
  loop
    select stock_by_size into product_stock
    from public.products
    where id = order_item.product_id
    for update;

    if found then
      product_stock := coalesce(product_stock, '{}'::jsonb);
      current_quantity := greatest(coalesce((product_stock ->> order_item.size)::integer, 0), 0);
      next_stock := jsonb_set(
        product_stock,
        array[order_item.size],
        to_jsonb(greatest(current_quantity - order_item.quantity, 0)),
        true
      );

      update public.products
      set stock_by_size = next_stock,
          in_stock = exists (
            select 1
            from jsonb_each_text(next_stock) as stock_entry
            where stock_entry.value::integer > 0
          ),
          updated_at = now()
      where id = order_item.product_id;
    end if;
  end loop;

  update public.orders
  set inventory_adjusted = true,
      updated_at = now()
  where id = p_order_id;

  return true;
end;
$function$;

revoke execute on function public.apply_order_inventory(uuid) from public, anon, authenticated;
grant execute on function public.apply_order_inventory(uuid) to service_role;
