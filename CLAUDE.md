# Taze — Proje Bağlamı

Bu dosya, bu projede çalışan herhangi bir Claude oturumunun (Claude Code,
Cowork, vb.) hızlıca bağlam kazanması için yazıldı.

## Fikir

Türkiye'de çiftçiler ürettiklerine hak ettikleri fiyatı alamıyor, tüketiciler
ise aynı ürünü çok daha pahalıya alıyor. Sorunun temel nedeni görünürlük
eksikliği ve iletişim zayıflığı. Taze, üreticilerin ürettiği ürünleri
paylaştığı, tüketicilerin ise haritada yakınındaki üreticileri görebildiği bir
platform. İlk yılında tamamen ücretsiz.

Net fark: "haritayı aç, o an çevrende kim ne yetiştiriyor gör" — Instagram/
WhatsApp'ın konuma göre çalışmaması, ÇiftçidenEve'in şeffaf fiyat sunmaması ve
DİTAP'ın pratikte çalışmaması nedeniyle bu boşluğu dolduruyoruz.

## Kurucu profili

- Tek başına çalışıyor, kimseyi işe almıyor
- Kod, Claude ile birlikte yazılıyor
- Windows + Anaconda kullanıyor, terminal yerine GUI tabanlı araçları tercih
  ediyor
- Bütçe: $250 (domain, sunucu, app store harcı dışında gider yok)

## Stack ve teknik kararlar

- **Next.js** (App Router, TypeScript, Tailwind CSS) — web arayüzü
- **Supabase** — telefon + SMS OTP auth ve Postgres veritabanı
- **Leaflet + OpenStreetMap** — harita (ücretsiz, kredi kartı istemiyor)
- **Vercel** — barındırma (ücretsiz plan)
- Native app yerine: önce web, sonra PWA/wrapper (Median, PWA Builder vb.) ile
  Play Store'a paketleme. TWA için domain doğrulaması gerekiyor
  (`/.well-known/assetlinks.json`).
- Play Store önce, Apple App Store ürün oturduktan sonra.

## MVP kapsamı (sıralama)

1. **Üretici kayıt** (telefon + SMS OTP) + "bugün elimde ne var" ekleme formu
   — `src/app/uretici-kayit/page.tsx` ✅ ilk versiyon yazıldı
2. Tüketici tarafı: harita üzerinde üreticileri göster, tıklayınca ürün listesi
   — henüz yapılmadı
3. Basit arama/filtre (ürün türüne göre) — henüz yapılmadı
4. PWA/wrapper ile Play Store paketleme — henüz yapılmadı

Pilot bölge (tek mahalle/ilçe ile başlama) şu an için belirlenmedi; platform
bölge bağımsız genel çalışıyor.

## Veritabanı

`supabase/schema.sql` içinde iki tablo var:

- `producers` — üretici profili (ad soyad, telefon, adres/lat-lng)
- `products` — "bugün elimde ne var" listesi (ürün adı, miktar, birim, fiyat,
  açıklama)

Her ikisinde de Row Level Security açık: herkes okuyabilir, sadece kendi
kaydını (auth.uid() eşleşmesiyle) ekleyip güncelleyebilir.

## Demo mod

`.env.local` doldurulmadan da proje çalışır: `src/lib/supabase.ts` içindeki
`isSupabaseConfigured` false döner, `uretici-kayit` sayfası gerçek SMS/DB
olmadan akışı simüle eder. Supabase bağlandığında otomatik olarak gerçek moda
geçer — kod değişikliği gerekmez.

## Yapılmadı / bilinçli ertelendi

- Tüketici harita sayfası
- Ödeme / sipariş akışı (ilk yıl ücretsiz, bu yüzden öncelik değil)
- Gelir modeli (sponsorlu listeleme, komisyon, B2B, CSA sepeti vb.) — ileride
  değerlendirilecek
- Yasal: ileride kurye/doğrudan satış şirketine dönülürse cayma hakkı ve
  komisyon mevzuatına dikkat

## Sıradaki adım

Tüketici tarafı: harita üzerinde üreticileri gösterme (Leaflet + OSM),
tıklayınca o üreticinin güncel ürün listesini açma.
