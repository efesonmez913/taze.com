"use client";

import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toE164TR, formatPhoneForDisplay } from "@/lib/phone";
import type { UrunTaslak } from "@/lib/types";
import UrunSatiri from "@/components/UrunSatiri";
import {
  otpHatasiniCevir,
  kodGonderHatasiniCevir,
  kaydetHatasiniCevir,
} from "@/lib/hata";

type Adim = "telefon" | "kod" | "profil" | "tamam";
type KonumDurumu = "bos" | "yukleniyor" | "tamam" | "hata";

function bosUrun(): UrunTaslak {
  return {
    gecici_id: crypto.randomUUID(),
    urun_adi: "",
    miktar: "",
    birim: "kg",
    fiyat: "",
    aciklama: "",
    foto: null,
    fotoOnizlemeUrl: null,
  };
}

export default function UreticiKayitPage() {
  const [adim, setAdim] = useState<Adim>("telefon");
  const [telefonInput, setTelefonInput] = useState("");
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const [adSoyad, setAdSoyad] = useState("");
  const [adres, setAdres] = useState("");
  const [urunler, setUrunler] = useState<UrunTaslak[]>([bosUrun()]);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [konumDurumu, setKonumDurumu] = useState("bos" as KonumDurumu);

  const telefonE164 = toE164TR(telefonInput);

  async function kodGonder() {
    setHata(null);
    if (!telefonE164) {
      setHata("Telefon numarasını 05XX XXX XX XX formatında gir.");
      return;
    }

    setYukleniyor(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: telefonE164,
        });
        if (error) throw error;
      }
      setAdim("kod");
    } catch (e) {
      setHata(kodGonderHatasiniCevir(e));
    } finally {
      setYukleniyor(false);
    }
  }

  async function koduDogrula() {
    setHata(null);
    if (kod.trim().length < 4) {
      setHata("Lütfen SMS ile gelen kodu gir.");
      return;
    }

    setYukleniyor(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.verifyOtp({
          phone: telefonE164 as string,
          token: kod.trim(),
          type: "sms",
        });
        if (error) throw error;
      } else {
        // Demo mod: Supabase henüz bağlı değil, herhangi bir 4+ haneli kodu kabul et.
        await new Promise((r) => setTimeout(r, 400));
      }
      setAdim("profil");
    } catch (e) {
      setHata(otpHatasiniCevir(e));
    } finally {
      setYukleniyor(false);
    }
  }

  function urunGuncelle(id: string, patch: Partial<UrunTaslak>) {
    setUrunler((prev) =>
      prev.map((u) => (u.gecici_id === id ? { ...u, ...patch } : u))
    );
  }

  function urunKaldir(id: string) {
    setUrunler((prev) => prev.filter((u) => u.gecici_id !== id));
  }

  function urunEkle() {
    setUrunler((prev) => [...prev, bosUrun()]);
  }

  function konumAl() {
    if (!("geolocation" in navigator)) {
      setKonumDurumu("hata");
      setHata("Tarayıcın konum servisini desteklemiyor.");
      return;
    }

    setKonumDurumu("yukleniyor");
    setHata(null);
    navigator.geolocation.getCurrentPosition(
      (pozisyon) => {
        setLat(pozisyon.coords.latitude);
        setLng(pozisyon.coords.longitude);
        setKonumDurumu("tamam");
      },
      () => {
        setKonumDurumu("hata");
        setHata(
          "Konum alınamadı. Tarayıcı izin istediğinde 'İzin ver'e bastığından emin ol, ya da adres alanını elle doldur."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function kaydet() {
    setHata(null);
    if (!adSoyad.trim()) {
      setHata("Ad soyad gerekli.");
      return;
    }
    const gecerliUrunler = urunler.filter((u) => u.urun_adi.trim());
    if (gecerliUrunler.length === 0) {
      setHata("En az bir ürün eklemelisin.");
      return;
    }

    setYukleniyor(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Oturum bulunamadı, baştan dene.");

        const { error: producerError } = await supabase
          .from("producers")
          .upsert({
            id: user.id,
            ad_soyad: adSoyad.trim(),
            telefon: telefonE164,
            adres_metni: adres.trim() || null,
            lat,
            lng,
          });
        if (producerError) throw producerError;

        // Fotoğrafı olan ürünleri önce Supabase Storage'a yükle,
        // her biri için genel (public) bir URL al.
        const urunlerFotoUrlIle = await Promise.all(
          gecerliUrunler.map(async (u) => {
            if (!u.foto) return { ...u, yuklenen_foto_url: null as string | null };

            const uzanti = u.foto.name.split(".").pop() || "jpg";
            const dosyaYolu = `${user.id}/${crypto.randomUUID()}.${uzanti}`;

            const { error: yuklemeHatasi } = await supabase.storage
              .from("urun-fotograflari")
              .upload(dosyaYolu, u.foto);
            if (yuklemeHatasi) throw yuklemeHatasi;

            const {
              data: { publicUrl },
            } = supabase.storage
              .from("urun-fotograflari")
              .getPublicUrl(dosyaYolu);

            return { ...u, yuklenen_foto_url: publicUrl };
          })
        );

        const { error: productsError } = await supabase.from("products").insert(
          urunlerFotoUrlIle.map((u) => ({
            producer_id: user.id,
            urun_adi: u.urun_adi.trim(),
            miktar: u.miktar ? Number(u.miktar) : null,
            birim: u.birim,
            fiyat: u.fiyat ? Number(u.fiyat) : null,
            aciklama: u.aciklama.trim() || null,
            foto_url: u.yuklenen_foto_url,
          }))
        );
        if (productsError) throw productsError;
      } else {
        // Demo mod: veritabanı yok, sadece bekleme simülasyonu yap.
        await new Promise((r) => setTimeout(r, 500));
      }
      setAdim("tamam");
    } catch (e) {
      setHata(kaydetHatasiniCevir(e));
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-taze-green">Üretici kaydı</h1>
      <p className="mt-1 text-sm text-taze-soil/70">
        Telefon numaranla giriş yap, sonra bugün elinde ne varsa ekle.
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Demo mod: Supabase henüz bağlanmadı, bu yüzden gerçek SMS
          gönderilmiyor ve veriler kaydedilmiyor. Akışı test etmek için
          herhangi bir telefon numarası ve 4+ haneli bir kod girebilirsin.
        </div>
      )}

      {hata && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {hata}
        </div>
      )}

      {adim === "telefon" && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-taze-soil/80">
              Telefon numarası
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="05XX XXX XX XX"
              value={formatPhoneForDisplay(telefonInput)}
              onChange={(e) => setTelefonInput(e.target.value)}
              className="w-full rounded-lg border border-taze-green/20 px-4 py-3 text-base focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
            />
          </div>
          <button
            onClick={kodGonder}
            disabled={yukleniyor}
            className="w-full rounded-full bg-taze-green px-6 py-3 font-semibold text-white transition hover:bg-taze-green/90 disabled:opacity-50"
          >
            {yukleniyor ? "Gönderiliyor..." : "Kod gönder"}
          </button>
        </div>
      )}

      {adim === "kod" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-taze-soil/70">
            {formatPhoneForDisplay(telefonInput)} numarasına gönderilen kodu
            gir.
          </p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1 2 3 4 5 6"
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            className="w-full rounded-lg border border-taze-green/20 px-4 py-3 text-center text-lg tracking-[0.5em] focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
          />
          <button
            onClick={koduDogrula}
            disabled={yukleniyor}
            className="w-full rounded-full bg-taze-green px-6 py-3 font-semibold text-white transition hover:bg-taze-green/90 disabled:opacity-50"
          >
            {yukleniyor ? "Doğrulanıyor..." : "Doğrula"}
          </button>
          <button
            onClick={() => setAdim("telefon")}
            className="w-full text-sm text-taze-soil/60 underline"
          >
            Numarayı değiştir
          </button>
        </div>
      )}

      {adim === "profil" && (
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-taze-soil/80">
                Ad Soyad
              </label>
              <input
                type="text"
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                placeholder="Örn. Ayşe Yılmaz"
                className="w-full rounded-lg border border-taze-green/20 px-4 py-3 text-base focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-taze-soil/80">
                Adres / bölge (opsiyonel)
              </label>
              <input
                type="text"
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
                placeholder="Örn. Karşıyaka, İzmir"
                className="w-full rounded-lg border border-taze-green/20 px-4 py-3 text-base focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-taze-soil/80">
                Konum
              </label>
              <p className="mb-2 text-xs text-taze-soil/60">
                Haritada doğru yerde görünmen için gerçek konumunu almamız
                gerekiyor. Tarayıcı izin isteyecek, "İzin ver" demen yeterli.
              </p>
              <button
                type="button"
                onClick={konumAl}
                disabled={konumDurumu === "yukleniyor"}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-taze-green px-4 py-3 text-sm font-semibold text-taze-green transition hover:bg-taze-green/10 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  {konumDurumu === "yukleniyor" && "Konum alınıyor..."}
                  {konumDurumu === "bos" && "Konumumu kullan"}
                  {konumDurumu === "tamam" &&
                    "Konum alındı, değiştirmek için tekrar tıkla"}
                  {konumDurumu === "hata" && "Tekrar dene"}
                </span>
              </button>
              {konumDurumu === "tamam" && lat !== null && lng !== null && (
                <p className="mt-1 text-xs text-taze-green">
                  Konum kaydedildi ({lat.toFixed(4)}, {lng.toFixed(4)})
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-taze-green">
                Bugün elimde ne var?
              </h2>
              <button
                type="button"
                onClick={urunEkle}
                className="rounded-full border border-taze-green px-4 py-1.5 text-sm font-medium text-taze-green hover:bg-taze-green/10"
              >
                + Ürün ekle
              </button>
            </div>

            <div className="space-y-3">
              {urunler.map((u) => (
                <UrunSatiri
                  key={u.gecici_id}
                  urun={u}
                  onChange={urunGuncelle}
                  onRemove={urunKaldir}
                  removable={urunler.length > 1}
                />
              ))}
            </div>
          </div>

          <button
            onClick={kaydet}
            disabled={yukleniyor}
            className="w-full rounded-full bg-taze-green px-6 py-3 font-semibold text-white transition hover:bg-taze-green/90 disabled:opacity-50"
          >
            {yukleniyor ? "Kaydediliyor..." : "Kaydet ve yayınla"}
          </button>
        </div>
      )}

      {adim === "tamam" && (
        <div className="mt-10 rounded-xl border border-taze-leaf/30 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-semibold text-taze-green">
            Kaydın alındı!
          </p>
          <p className="mt-2 text-taze-soil/70">
            {isSupabaseConfigured
              ? "Ürünlerin haritada görünmeye başlayacak."
              : "Bu bir demo kayıttı — Supabase bağlandığında gerçek verilerle çalışacak."}
          </p>
        </div>
      )}
    </main>
  );
}