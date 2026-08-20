-- Promo automatica Minimal Days: nessun codice richiesto.
-- Durata globale: fino al 22 agosto 2026 alle 18:30 UTC (20:30 in Italia).
-- Limita volutamente l'aggiornamento al brand Minimal Couture e non al profilo
-- fornitore "minimal", che include anche prodotti di altri marchi.
create extension if not exists pg_cron with schema extensions;

update public.products
set price = 29.90,
    updated_at = now()
where lower(trim(brand)) = 'minimal couture'
  and price is distinct from 29.90;

do $schedule$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'mirai_minimal_days_expiry'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'mirai_minimal_days_expiry',
    '30 18 22 8 *',
    $job$
      update public.products
      set price = case id
        when '8d73cad5-9430-4fcf-be71-be9f6afeffe5'::uuid then 55.00
        when '93638035-fc17-4d46-b4a0-c4129cd54d42'::uuid then 50.00
        when 'ada8b320-be31-426c-b47f-91c74951e23e'::uuid then 45.00
        when '3e3acd47-bb56-495a-9ddd-f89d60d003ec'::uuid then 50.00
        when '1b97e5e9-50b6-4fff-9bfc-d812baca722c'::uuid then 55.00
        when '8e0ff625-3cbc-4ad8-8470-5c66c9b8ecf9'::uuid then 45.00
        when '2f1ae414-2e5c-45e4-8db9-67034e173be5'::uuid then 45.00
        when '4df18da9-5321-4368-b49a-0455dc566e34'::uuid then 50.00
        when '95e77b7a-90b6-4b12-9b03-63f0f97cf286'::uuid then 45.00
        when 'b192c58e-e27f-4721-98ec-86959ea7eac1'::uuid then 45.00
        when 'ce52d2c3-1af9-41cd-a5f0-8ffba58346d3'::uuid then 45.00
        when '8b048175-c7be-4453-be13-8af904aca0bb'::uuid then 45.00
        when '824c2ce3-95d1-4e52-8455-f681379c4071'::uuid then 45.00
        when '8f21753c-398d-476e-9368-e073757ae61b'::uuid then 45.00
        when '17973586-ba02-4ccf-8c2a-342ce8fdf185'::uuid then 45.00
        else price
      end,
      updated_at = now()
      where lower(trim(brand)) = 'minimal couture';

      select cron.unschedule('mirai_minimal_days_expiry');
    $job$
  );
end
$schedule$;
