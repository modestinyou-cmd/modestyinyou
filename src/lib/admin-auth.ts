import 'server-only';

export function getConfiguredAdminEmails(): string[] {
  const configured = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isConfiguredAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getConfiguredAdminEmails().includes(email.trim().toLowerCase());
}
