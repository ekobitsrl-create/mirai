-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  image_url text,
  description text,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Everyone can read products (public catalog)
create policy "products_select_public" on public.products
  for select using (true);

-- Only admins can insert products
create policy "products_admin_insert" on public.products
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can update products
create policy "products_admin_update" on public.products
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can delete products
create policy "products_admin_delete" on public.products
  for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Seed initial products
insert into public.products (name, category, price, image_url, description, is_new) values
  ('Shadow Hoodie', 'Felpe', 189.00, '/images/product-1.jpg', 'Felpa tecnica con cappuccio in tessuto idrorepellente. Design minimale con dettagli riflettenti.', true),
  ('Tactical Cargo', 'Pantaloni', 225.00, '/images/product-2.jpg', 'Pantaloni cargo tecnici con tasche utility e tessuto resistente. Taglio contemporaneo.', true),
  ('Stealth Jacket', 'Giacche', 350.00, '/images/product-3.jpg', 'Giacca impermeabile con membrana traspirante. Chiusura magnetica e cappuccio regolabile.', false),
  ('Core Tee', 'T-Shirt', 89.00, '/images/product-4.jpg', 'T-shirt essenziale in cotone organico premium. Taglio rilassato con cuciture rinforzate.', false),
  ('Utility Sling', 'Accessori', 145.00, '/images/product-5.jpg', 'Borsa a tracolla in nylon balistico con chiusure a sgancio rapido. Compartimenti multipli.', true),
  ('Void Bomber', 'Giacche', 295.00, '/images/product-6.jpg', 'Bomber jacket in tessuto tecnico con imbottitura leggera. Polsini e orlo a costine.', false);
