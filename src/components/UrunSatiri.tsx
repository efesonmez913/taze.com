"use client";

import { useRef } from "react";
import type { UrunTaslak } from "@/lib/types";

type Props = {
  urun: UrunTaslak;
  onChange: (id: string, patch: Partial<UrunTaslak>) => void;
  onRemove: (id: string) => void;
  removable: boolean;
};

const BIRIMLER = ["kg", "adet", "demet", "litre", "kasa"];

export default function UrunSatiri({
  urun,
  onChange,
  onRemove,
  removable,
}: Props) {
  const dosyaInputRef = useRef<HTMLInputElement>(null);

  function fotoSecildi(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    if (urun.fotoOnizlemeUrl) {
      URL.revokeObjectURL(urun.fotoOnizlemeUrl);
    }
    const onizlemeUrl = URL.createObjectURL(dosya);
    onChange(urun.gecici_id, { foto: dosya, fotoOnizlemeUrl: onizlemeUrl });
  }

  function fotoKaldir() {
    if (urun.fotoOnizlemeUrl) {
      URL.revokeObjectURL(urun.fotoOnizlemeUrl);
    }
    onChange(urun.gecici_id, { foto: null, fotoOnizlemeUrl: null });
    if (dosyaInputRef.current) dosyaInputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-taze-green/15 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        {urun.fotoOnizlemeUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-taze-green/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urun.fotoOnizlemeUrl}
              alt="Ürün fotoğrafı"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-taze-green/30 text-2xl">
            📷
          </div>
        )}

        <div className="flex flex-col gap-1">
          <input
            ref={dosyaInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={fotoSecildi}
            className="hidden"
            id={`foto-${urun.gecici_id}`}
          />
          <label
            htmlFor={`foto-${urun.gecici_id}`}
            className="cursor-pointer rounded-full border border-taze-green px-4 py-1.5 text-sm font-medium text-taze-green hover:bg-taze-green/10"
          >
            {urun.fotoOnizlemeUrl ? "Fotoğrafı değiştir" : "📷 Fotoğraf çek / seç"}
          </label>
          {urun.fotoOnizlemeUrl && (
            <button
              type="button"
              onClick={fotoKaldir}
              className="text-left text-xs text-red-500 underline"
            >
              Fotoğrafı kaldır
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="sm:col-span-4">
          <label className="mb-1 block text-xs font-medium text-taze-soil/70">
            Ürün adı
          </label>
          <input
            type="text"
            required
            placeholder="Örn. Domates"
            value={urun.urun_adi}
            onChange={(e) => onChange(urun.gecici_id, { urun_adi: e.target.value })}
            className="w-full rounded-lg border border-taze-green/20 px-3 py-2 text-sm focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-taze-soil/70">
            Miktar
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="10"
            value={urun.miktar}
            onChange={(e) => onChange(urun.gecici_id, { miktar: e.target.value })}
            className="w-full rounded-lg border border-taze-green/20 px-3 py-2 text-sm focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-taze-soil/70">
            Birim
          </label>
          <select
            value={urun.birim}
            onChange={(e) => onChange(urun.gecici_id, { birim: e.target.value })}
            className="w-full rounded-lg border border-taze-green/20 px-3 py-2 text-sm focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
          >
            {BIRIMLER.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-taze-soil/70">
            Fiyat (₺)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Opsiyonel"
            value={urun.fiyat}
            onChange={(e) => onChange(urun.gecici_id, { fiyat: e.target.value })}
            className="w-full rounded-lg border border-taze-green/20 px-3 py-2 text-sm focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
          />
        </div>

        <div className="flex items-end sm:col-span-2">
          <button
            type="button"
            onClick={() => onRemove(urun.gecici_id)}
            disabled={!removable}
            className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Kaldır
          </button>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-taze-soil/70">
          Açıklama (opsiyonel)
        </label>
        <input
          type="text"
          placeholder="Örn. Serada yetişti, bugün sabah toplandı"
          value={urun.aciklama}
          onChange={(e) => onChange(urun.gecici_id, { aciklama: e.target.value })}
          className="w-full rounded-lg border border-taze-green/20 px-3 py-2 text-sm focus:border-taze-green focus:outline-none focus:ring-1 focus:ring-taze-green"
        />
      </div>
    </div>
  );
}
