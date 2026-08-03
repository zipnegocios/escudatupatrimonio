/**
 * DISP_CHECK — lógica invisible que decide entre DISP_NOW y DISP_SCHED.
 * Regla del documento: lunes a sábado, 9:00am–9:00pm en la zona horaria del
 * estado del prospecto.
 */
export function isBusinessHours(timezone: string, now: Date = new Date()): boolean {
  const local = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const day = local.getDay(); // 0=domingo .. 6=sábado
  const hour = local.getHours();
  return day >= 1 && day <= 6 && hour >= 9 && hour < 21;
}
