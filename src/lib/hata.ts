// Supabase'den gelen İngilizce hata mesajlarını, kullanıcının anlayacağı
// Türkçe mesajlara çeviriyoruz. Tanımadığımız bir hata gelirse genel bir
// mesaj gösteriyoruz (ham İngilizce metni ekrana hiç yansıtmıyoruz).
export function otpHatasiniCevir(e: unknown): string {
  const mesaj = e instanceof Error ? e.message.toLowerCase() : "";

  if (mesaj.includes("expired") || mesaj.includes("invalid")) {
    return "Girdiğin kod yanlış ya da süresi dolmuş. SMS'i tekrar kontrol et; yanlışsa 'Numarayı değiştir' diyip yeni kod iste.";
  }
  if (mesaj.includes("too many") || mesaj.includes("rate limit")) {
    return "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar dene.";
  }
  return "Kod doğrulanamadı, tekrar dene.";
}

export function kodGonderHatasiniCevir(e: unknown): string {
  const mesaj = e instanceof Error ? e.message.toLowerCase() : "";

  if (mesaj.includes("invalid") && mesaj.includes("phone")) {
    return "Bu telefon numarası geçersiz görünüyor. 05XX XXX XX XX formatında tekrar dene.";
  }
  if (mesaj.includes("too many") || mesaj.includes("rate limit")) {
    return "Çok fazla kod isteği yapıldı. Birkaç dakika bekleyip tekrar dene.";
  }
  return "Kod gönderilirken bir sorun oluştu, tekrar dene.";
}

export function kaydetHatasiniCevir(e: unknown): string {
  return e instanceof Error
    ? "Kaydedilirken bir sorun oluştu: " +
        (e.message.toLowerCase().includes("network")
          ? "internet bağlantısı sorunu olabilir, tekrar dene."
          : "lütfen tekrar dene.")
    : "Kaydedilirken bir sorun oluştu.";
}