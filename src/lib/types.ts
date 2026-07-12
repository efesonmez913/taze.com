export type Producer = {
  id: string;
  ad_soyad: string;
  telefon: string;
  adres_metni: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export type Product = {
  id: string;
  producer_id: string;
  urun_adi: string;
  miktar: number | null;
  birim: string;
  fiyat: number | null;
  aciklama: string | null;
  foto_url: string | null;
  aktif: boolean;
  created_at: string;
};

// "Bugün elimde ne var" formunda henüz veritabanına gönderilmemiş,
// kullanıcının doldurduğu tek bir ürün satırı.
export type UrunTaslak = {
  gecici_id: string;
  urun_adi: string;
  miktar: string;
  birim: string;
  fiyat: string;
  aciklama: string;
  foto: File | null;
  fotoOnizlemeUrl: string | null;
};
