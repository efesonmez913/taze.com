# Taze

Yerel üretici–tüketici platformu. Bu README, projeyi kendi bilgisayarında
ayağa kaldırman için adım adım anlatıyor. Terminal kullanımı minimumda
tutuldu; her adımda ne yazacağını aynen kopyalayabilirsin.

## 1) Projeyi aç

Bu zip'i `taze.com` klasörünün içine (veya istediğin bir klasöre) çıkar.
VS Code kullanıyorsan: VS Code'u aç → "File > Open Folder" → çıkardığın
`taze` klasörünü seç.

## 2) Bağımlılıkları kur

VS Code içinde üstteki menüden **Terminal > New Terminal** ile bir terminal
aç (bu, kod yazmak değil sadece hazır bir komutu çalıştırmak demek) ve şunu
yapıştırıp Enter'a bas:

```
npm install
```

Bu, `package.json` içinde listelenen tüm paketleri (Next.js, Supabase client,
Tailwind vb.) indirir. İnternet bağlantına göre birkaç dakika sürebilir.

## 3) Supabase projesi oluştur (GUI üzerinden)

1. https://supabase.com adresine git, ücretsiz hesap oluştur.
2. "New Project" ile yeni bir proje oluştur (isim: `taze`, bölge: Frankfurt
   veya en yakın Avrupa bölgesi mantıklı).
3. Proje açıldıktan sonra sol menüden **Authentication > Sign In / Providers**
   sayfasına git, **Phone** sağlayıcısını aç. Supabase'in kendi SMS
   sağlayıcısı yok; **Twilio**, **MessageBird** veya **Vonage** gibi bir SMS
   servisiyle entegre etmen gerekiyor (Twilio en yaygın kullanılanı — ücretsiz
   deneme kredisi sunuyor). Bu ekranda istenen Account SID / Auth Token /
   Messaging Service SID bilgilerini Twilio hesabından alıp yapıştırman
   yeterli, kod yazmana gerek yok.
4. Sol menüden **SQL Editor**'a git, **New query** de. Bu projedeki
   `supabase/schema.sql` dosyasının tüm içeriğini kopyala, SQL Editor'a
   yapıştır ve **Run** butonuna bas. Bu, `producers` ve `products`
   tablolarını ve güvenlik kurallarını (RLS) oluşturur.
5. Sol menüden **Project Settings > API** sayfasına git. Burada iki değeri
   kopyala:
   - **Project URL**
   - **anon public** key (bu genel/herkese açık anahtardır, `service_role`
     anahtarını ASLA kullanma/paylaşma)

## 4) Ortam değişkenlerini gir

Proje klasöründeki `.env.local.example` dosyasını kopyala, adını
`.env.local` yap (VS Code'da dosyaya sağ tık > Copy, sonra Paste, sonra
Rename). İçini az önce kopyaladığın Project URL ve anon key ile doldur:

```
NEXT_PUBLIC_SUPABASE_URL=https://senin-projen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=senin-anon-keyin
```

## 5) Projeyi çalıştır

Terminalde:

```
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç. Ana sayfadan "Üreticiyim,
kayıt olmak istiyorum" butonuna basarak telefon + SMS OTP + "bugün elimde ne
var" akışını deneyebilirsin.

> `.env.local` doldurulmadan da proje çalışır — bu durumda sayfa üstte sarı
> bir "Demo mod" uyarısı gösterir, gerçek SMS gönderilmez, herhangi bir kodla
> ilerleyebilirsin. Bu, Supabase'i henüz kurmadan arayüzü görmek istersen
> işine yarar.

## Sıradaki adımlar

`CLAUDE.md` dosyasında proje bağlamı, MVP sıralaması ve "sıradaki adım" notu
var — bir sonraki oturumda Claude'a bu dosyayı okutarak kaldığın yerden devam
edebilirsin.
