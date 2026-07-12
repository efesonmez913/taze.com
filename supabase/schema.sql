-- Taze — başlangıç veritabanı şeması
-- Supabase Dashboard > SQL Editor içine yapıştırıp çalıştır (Run).

-- 1) Üreticiler tablosu
-- Her üretici, Supabase Auth'taki bir kullanıcıya (telefon+OTP ile giriş yapan) karşılık gelir.
create table if not exists public.producers (
  id uuid primary key references auth.users (id) on delete cascade,
  ad_soyad text not null,
  telefon text not null,
  adres_metni text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

alter table public.producers enable row level security;

-- Herkes üreticileri görebilir (harita için gerekli)
create policy "Üreticiler herkese açık okunabilir"
  on public.producers for select
  using (true);

-- Bir üretici sadece kendi kaydını oluşturabilir/güncelleyebilir
create policy "Üretici kendi kaydını oluşturur"
  on public.producers for insert
  with check (auth.uid() = id);

create policy "Üretici kendi kaydını günceller"
  on public.producers for update
  using (auth.uid() = id);

-- 2) Ürünler tablosu ("bugün elimde ne var")
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  producer_id uuid not null references public.producers (id) on delete cascade,
  urun_adi text not null,
  miktar numeric,
  birim text default 'kg',
  fiyat numeric,
  aciklama text,
  foto_url text,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Herkes aktif ürünleri görebilir
create policy "Ürünler herkese açık okunabilir"
  on public.products for select
  using (true);

-- Üretici sadece kendi ürününü ekleyebilir
create policy "Üretici kendi ürününü ekler"
  on public.products for insert
  with check (
    producer_id in (select id from public.producers where id = auth.uid())
  );

-- Üretici sadece kendi ürününü güncelleyebilir/silebilir
create policy "Üretici kendi ürününü günceller"
  on public.products for update
  using (
    producer_id in (select id from public.producers where id = auth.uid())
  );

create policy "Üretici kendi ürününü siler"
  on public.products for delete
  using (
    producer_id in (select id from public.producers where id = auth.uid())
  );

-- Faydalı index'ler
create index if not exists products_producer_id_idx on public.products (producer_id);
create index if not exists products_aktif_idx on public.products (aktif);

-- 3) Ürün fotoğrafları için Storage bucket'ı
-- Not: Bucket'ı Dashboard > Storage > New bucket üzerinden GUI ile de
-- oluşturabilirsin (isim: urun-fotograflari, Public: açık). Bu SQL de
-- aynı işi otomatik yapar.
insert into storage.buckets (id, name, public)
values ('urun-fotograflari', 'urun-fotograflari', true)
on conflict (id) do nothing;

-- Herkes fotoğrafları görebilir (herkese açık bucket)
create policy "Ürün fotoğrafları herkese açık okunabilir"
  on storage.objects for select
  using (bucket_id = 'urun-fotograflari');

-- Sadece giriş yapmış üreticiler fotoğraf yükleyebilir
create policy "Üretici fotoğraf yükleyebilir"
  on storage.objects for insert
  with check (bucket_id = 'urun-fotograflari' and auth.role() = 'authenticated');
