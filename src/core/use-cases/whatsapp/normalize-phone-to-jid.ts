// Los leads son de EE.UU. (todo el Smart Form asume estado/timezone de
// EE.UU.), así que un teléfono de 10 dígitos sin código de país se asume
// +1. Si ya viene con 11+ dígitos se usa tal cual — cubre el caso de que
// alguien haya tipeado el código de país a mano.
export function normalizePhoneToJid(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountryCode = digits.length === 10 ? `1${digits}` : digits;
  return `${withCountryCode}@s.whatsapp.net`;
}
