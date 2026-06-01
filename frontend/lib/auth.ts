const TOKEN_KEY = "citron_society_token";
const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "chairman",
  "secretary",
  "treasurer",
];

interface CitronUser {
  userId: string;
  email: string;
  role: string;
  additional_roles: string[];
  accountType: string;
  isAdmin: boolean;
  fullName: string | null;
  phone: string | null;
  wing: string | null;
  unitNumber: string | null;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getSocietyUser(): CitronUser | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload || !payload.sub) return null;

  // Check expiry
  if (payload.exp && typeof payload.exp === "number") {
    if (Math.floor(Date.now() / 1000) >= payload.exp) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }

  const allRoles: string[] = [
    payload.role as string,
    ...((payload.additional_roles as string[]) || []),
  ].filter(Boolean);

  // Citron-native admin tokens have `username` but no `role`
  const isCitronAdmin = !!(payload.username as string) && !payload.role;

  return {
    userId: payload.sub as string,
    email: payload.email as string,
    role: payload.role as string,
    additional_roles: (payload.additional_roles as string[]) || [],
    accountType: (payload.accountType as string) || "user",
    isAdmin: isCitronAdmin || allRoles.some((r) => ADMIN_ROLES.includes(r)),
    fullName: (payload.fullName as string) || null,
    phone: (payload.phone as string) || null,
    wing: (payload.wing as string) || null,
    unitNumber: (payload.unitNumber as string) || null,
  };
}

export function isAdminUser(): boolean {
  return getSocietyUser()?.isAdmin === true;
}

export function clearSocietyToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function storeSocietyToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}
