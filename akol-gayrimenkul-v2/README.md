# Akol Emlak Gayrimenkul · web sitesi (v2, Ekim 2026)

Yenikent / Sincan / Ankara'daki **Akol Emlak Gayrimenkul** için statik web sitesi.
Kurulum, veritabanı veya derleme adımı yok: HTML + CSS + biraz JavaScript.

## Sayfalar

| Dosya | Sayfa |
| --- | --- |
| `index.html` | Anasayfa: tabela başlık, LED kayan yazı, hizmetler, ilanlar bandı, ofis fotoğrafları, süreç, yorumlar, ziyaret |
| `hakkimizda.html` | Hakkımızda: nasıl çalışırız, vizyon/misyon, ilkeler, yorumlarda adı geçen ekip |
| `bolge.html` | Bölge Rehberi: tıklanınca değişen harita, 4 mahalle, 2 ana yol |
| `iletisim.html` | İletişim: telefon, adres, harita, WhatsApp talep formu |
| `404.html` | Sayfa bulunamadı |
| `portfoy.html` | Eski portföy adresi. Ziyaretçiyi sahibinden mağazasına yönlendirir |

**İlanlarımız** sekmesi doğrudan sahibinden mağazasını açar:
<https://akolemlak06.sahibinden.com/>. Sitede ilan kartı yok. İlanlar yalnızca
sahibinden'de güncel tutulur, böylece satılmış ilan sitede kalmaz.

## Bilgisayarda açmak

VS Code'da bu klasörü açın, **Terminal > New Terminal** ile terminal açıp şunu yazın:

```
npm run dev
```

Tarayıcı kendiliğinden `http://localhost:5190` adresini açar. Dosya kaydettikçe sayfa
yenilenir. Durdurmak için terminalde `Ctrl + C`.

> `index.html` dosyasına çift tıklayarak da açılır. Sayfa geçiş animasyonu (kepenk) ve
> galeri ise `npm run dev` ile açınca tam çalışır.

## Fotoğraflar (önemli)

Site şu dosya adlarını kullanır. Dosya yoksa o alanda kapalı kepenk görünümü çıkar,
sayfa bozulmaz.

| Dosya | Nerede görünür |
| --- | --- |
| `assets/ofis-cephe.jpg` | Anasayfa vitrin fotoğrafı ve İletişim sayfası (dışarıdan, tabela görünen kare) |
| `assets/ofis-vitrin.jpg` | Hakkımızda sayfası (vitrin / giriş) |
| `assets/foto/ofis-01.jpg` … `ofis-08.jpg` | Anasayfadaki "Ofisimiz" galerisi. Kaç tane koyarsanız o kadar görünür; hiç yoksa bölüm gizlenir |

Eski sitedeki `ofis-cephe.jpg` ve `ofis-vitrin.jpg` dosyaları aynı adla çalışır.
Yeni ofis fotoğraflarını `assets/foto/` klasörüne `ofis-01.jpg`, `ofis-02.jpg` … diye
koymanız yeterli. Ayrıntı: `assets/foto/BENIOKU.md`.

İpucu: fotoğrafları yüklemeden önce uzun kenarı 1600–2000 px olacak şekilde küçültün
(telefon fotoğrafları 4–8 MB olabiliyor, site yavaşlar).

## v2'de neler değişti

- **Yeni tasarım:** ofisin siyah tabelasından ilham alan koyu bantlar, tabela gibi geniş
  harfli başlıklar, kırmızı (#BD1426) marka rengi.
- **LED kayan yazı:** ofisteki LED panoya benzeyen, Türkçe karakterleri doğru gösteren
  kayan yazı (her sayfada kendi mesajı).
- **Kepenk geçişi:** sayfadan sayfaya geçerken kepenk iner ve yeni sayfada kalkar
  (Chrome, Edge, Safari 18+). Fotoğraflar da kaydırınca kepenk açılır gibi görünür.
- **Animasyonlar:** başlık satırları yükselerek gelir, bölümler kaydırdıkça belirir.
  Telefonunda "hareketi azalt" açık olanlara animasyon gösterilmez.
- **Portföy sayfası kaldırıldı**, yerine **İlanlarımız** sekmesi (sahibinden mağazası).
- Ana numara her yerde **0546 420 76 78**; Instagram yalnızca **@akolemlak**.
- "Aks" yerine sade dil: **Kazım Karabekir Caddesi (çarşı)** ve **Ayaş Yolu**.
- Bölge Rehberi'nde mahalleye tıklayınca harita oraya gider.
- WhatsApp talep formu: bütçe alanı eklendi, hizmet kartlarından gelen seçimler
  forma otomatik işlenir (örn. `iletisim.html?islem=kiralik&tip=daire#talep`).
- Ofis fotoğrafları için büyütmeli galeri.
- Yazı tipleri (Archivo, IBM Plex Mono) sitenin içinde, Google'a bağlanmadan yüklenir.

## Yayına almak

Klasörün tamamını herhangi bir statik barındırmaya yükleyebilirsiniz (Cloudflare Pages,
Netlify, Vercel). Netlify'da klasörü sürükleyip bırakmak yeterli.
Facebook künyesinde yazan `akolemlak.com` alan adı şu an çalışmıyor; alan adı geri
alınırsa bu siteye bağlanabilir. Alan adı belli olunca `og:image` adresini tam adrese
(`https://.../assets/ofis-cephe.jpg`) çevirmek paylaşım önizlemesini düzeltir.

## Teyit edilmesi iyi olanlar

- Adres: sahibinin Instagram bio'sunda **12. Cadde No:19/D**, Google kaydında **18/A**
  yazıyor. Sitede 19/D kullanıldı.
- Google puanı ve yorum sayısı (4,8 / 77) Temmuz 2026 verisidir.
