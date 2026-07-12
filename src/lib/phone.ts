// Türkiye telefon numaralarını Supabase/SMS servislerinin beklediği
// E.164 formatına (+905XXXXXXXXX) çevirir.
export function toE164TR(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  // 05XXXXXXXXX (11 hane) -> +905XXXXXXXXX
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+9${digits}`;
  }

  // 5XXXXXXXXX (10 hane) -> +905XXXXXXXXX
  if (digits.length === 10 && digits.startsWith("5")) {
    return `+90${digits}`;
  }

  // 905XXXXXXXXX (12 hane) -> +905XXXXXXXXX
  if (digits.length === 12 && digits.startsWith("90")) {
    return `+${digits}`;
  }

  // Zaten +90 ile başlıyorsa
  if (input.trim().startsWith("+90") && digits.length === 12) {
    return `+${digits}`;
  }

  return null;
}

export function formatPhoneForDisplay(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  const parts = [
    digits.slice(0, 4),
    digits.slice(4, 7),
    digits.slice(7, 9),
    digits.slice(9, 11),
  ].filter(Boolean);
  return parts.join(" ");
}
