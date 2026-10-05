# Akol Emlak Gayrimenkul sitesi: bağlam

Bu klasör, `taze.com` reposunun içinde duran **ayrı bir statik site**: Taze projesiyle
ilgisi yok. Müşteri: AKOL EMLAK GAYRİMENKUL, Yenikent / Sincan / Ankara. Kurucusu
Ferhat Karaman. (KKTC'deki "AKOL Global" ile karıştırma.)

## Kullanıcının kesin istekleri (önceki oturumlardan)

- Ana numara **her yerde 0546 420 76 78**. (0553 144 08 61 yalnızca İletişim
  sayfasında "Telefon 2" olarak durur.) WhatsApp: 0553 609 08 63.
- Instagram **yalnızca @akolemlak**. @akolemlakyenikent'e hiçbir link veya atıf yok;
  onun "18,6B takipçi" sayısı da kullanılmaz.
- **İlan derin linki yasak.** sahibinden ilan-detay ya da Instagram reel linkleri
  kısa sürede ölüyor. İlanlarla ilgili her şey mağaza köküne gider:
  `https://akolemlak06.sahibinden.com/`. İlan numarası da yazılmaz.
- Portföy sayfası yok; menüde **"İlanlarımız"** sekmesi sahibinden mağazasını açar.
  sahibinden bot erişimini engelliyor ve bulut ortamından da erişilemiyor, bu yüzden
  ilanları otomatik çekme kurulmadı.
- "Aks" gibi teknik kelimeler yok. Kazım Karabekir Caddesi = çarşı, Ayaş Yolu = ana yol.
- Yalnızca gerçek bilgi ve gerçek fotoğraf. Stok görsel, uydurma slogan, uydurma rakam yok.

## Doğrulanmış veri

`research/DATA.md`: adres (Mustafa Kemal Mah. 12. Cadde No:19/D; Google kaydı 18/A
diyor), koordinat 40.0009519, 32.5134781, saat her gün 09:00–20:30, Google 4,8 / 77
yorum (Temmuz 2026), TTBS yetki no 0601887, gerçek Google yorum metinleri.

## Tasarım sistemi ("Tabela", v2)

- Renkler `css/style.css` başındaki `:root` içinde: tabela siyahı `--fascia`, sıva beyazı
  `--paper`, logodan örneklenen kırmızı `--red: #bd1426`, koyu zeminde kırmızı yazı
  `--red-hot`.
- Yazı: Archivo (değişken; başlıklar `font-stretch: 112–125%`), etiketler IBM Plex Mono.
  Dosyalar `fonts/` içinde, Google'a istek yok (OFL lisansı `fonts/OFL.txt`).
- İmza hareketler: LED kayan yazı (`canvas[data-led]`, metni `data-led` niteliğinde),
  kepenk sayfa geçişi (`@view-transition`), fotoğraflarda kepenk açılışı
  (`.photo[data-shutter]`), kaydırmaya bağlı belirme (`[data-rise]`). Hepsi
  `prefers-reduced-motion` ile kapanır.
- Fotoğraf yuvaları: `assets/ofis-cephe.jpg`, `assets/ofis-vitrin.jpg`,
  `assets/foto/ofis-01..08.jpg`. Dosya yoksa `.photo.is-empty` kapalı kepenk görünümü;
  galeri hiç fotoğraf yoksa gizlenir.
- Sayfalar düz HTML. Ortak başlık/alt bilgi her sayfada tekrarlanır; birini
  değiştirirken beş sayfayı da (index, hakkimizda, bolge, iletisim, 404) güncelle.

## Çalıştırma

`npm run dev` → `server.js` (bağımlılıksız, canlı yenileme), varsayılan port 5190.
Kullanıcı Windows'ta terminal yerine GUI araçlarını tercih ediyor; adımları
kopyala-yapıştır komutlarla anlat.
