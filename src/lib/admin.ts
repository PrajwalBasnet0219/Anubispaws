export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "reikuozaki96@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
