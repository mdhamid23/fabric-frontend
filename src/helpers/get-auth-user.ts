import { cookies } from "next/headers";
import { z } from "zod";

const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

const ACCESS_TOKEN_COOKIE = "auth_server_access_token";

export const DecodedAuthTokenSchema = z.object({
  sub: z.string(),
  roles: z.array(z.string()).default([]),
  iss: z.string().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
});

export const AuthUserWithProfileSchema = z.object({
  id: z.coerce.number(),
  username: z.string(),
  email: z.string().email().optional().nullable(),
  roles: z.array(z.string()).default([]),
  facultyId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  roomNo: z.string().optional().nullable(),
  phoneNo: z.string().optional().nullable(),
  profileCompleted: z.boolean().optional(),
});

export type DecodedAuthToken = z.infer<typeof DecodedAuthTokenSchema>;
export type AuthUserWithProfile = z.infer<typeof AuthUserWithProfileSchema>;

type GetAuthUserOptions = {
  withProfile?: boolean;
};

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

function decodeJwtPayload(token: string): unknown {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format.");
  }

  return JSON.parse(base64UrlDecode(parts[1]));
}

async function getAccessTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

async function fetchAuthUserWithProfile(
  accessToken: string,
): Promise<AuthUserWithProfile | null> {
  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // NestJS /auth/me returns { authenticated, user } — unwrap
    const user = data?.user ?? data;

    return AuthUserWithProfileSchema.parse(user);
  } catch {
    return null;
  }
}

export async function getAuthUser(options?: {
  withProfile?: false;
}): Promise<DecodedAuthToken | null>;

export async function getAuthUser(options: {
  withProfile: true;
}): Promise<AuthUserWithProfile | null>;

export async function getAuthUser(
  options: GetAuthUserOptions = {},
): Promise<DecodedAuthToken | AuthUserWithProfile | null> {
  const accessToken = await getAccessTokenFromCookie();

  if (!accessToken) {
    return null;
  }

  if (options.withProfile) {
    return fetchAuthUserWithProfile(accessToken);
  }

  try {
    const decodedPayload = decodeJwtPayload(accessToken);
    return DecodedAuthTokenSchema.parse(decodedPayload);
  } catch {
    return null;
  }
}

export async function getAuthAccessToken(): Promise<string | null> {
  return getAccessTokenFromCookie();
}
