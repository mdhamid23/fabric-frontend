import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVER_BASE_URL = process.env.AUTH_SERVER_BASE_URL || "http://localhost:9000";

const CLIENT_ID = process.env.OAUTH2_CLIENT_ID || "nextjs-app";
const CLIENT_SECRET = process.env.OAUTH2_CLIENT_SECRET || "changeme";
const REDIRECT_URI = process.env.OAUTH2_REDIRECT_URI || "http://localhost:3000/api/auth/callback";

const ACCESS_TOKEN_COOKIE = "auth_server_access_token";
const REFRESH_TOKEN_COOKIE = "auth_server_refresh_token";
const ID_TOKEN_COOKIE = "auth_server_id_token";
const PKCE_COOKIE = "pkce_verifier";
const STATE_COOKIE = "oauth2_state";
const NONCE_COOKIE = "oauth2_nonce";

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 2; // 2 hours (matches auth server setting)
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const tokenCookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
};

/** Decode a JWT payload without signature verification.
 * Safe here because the token is received directly from the auth server
 * over a server-to-server fetch — it was never exposed to the browser. */
function parseJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
    } catch {
        return null;
    }
}

type TokenResponse = {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
        console.error("[OAUTH2 CALLBACK] Auth server returned error:", error);
        return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
    }

    if (!code) {
        return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
    }

    const codeVerifier = request.cookies.get(PKCE_COOKIE)?.value;
    const storedStateCookie = request.cookies.get(STATE_COOKIE)?.value;
    const storedNonce = request.cookies.get(NONCE_COOKIE)?.value;

    if (!codeVerifier) {
        console.error("[OAUTH2 CALLBACK] Missing PKCE verifier cookie");
        return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
    }

    // Validate state to prevent CSRF
    if (!storedStateCookie || !storedStateCookie.startsWith(`${returnedState}:`)) {
        console.error("[OAUTH2 CALLBACK] State mismatch — possible CSRF");
        return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
    }

    const next = storedStateCookie.split(":").slice(1).join(":") || "/admin/dashboard";

    // Exchange authorization code for tokens.
    // Use client_secret_basic (HTTP Basic Auth) to match the client's registered
    // client_authentication_methods. Credentials must NOT be in the body.
    const tokenBody = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
    });

    const basicCredentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    let tokens: TokenResponse;
    try {
        const tokenResponse = await fetch(`${AUTH_SERVER_BASE_URL}/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${basicCredentials}`,
                Accept: "application/json",
            },
            body: tokenBody.toString(),
            cache: "no-store",
        });

        if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.text();
            console.error("[OAUTH2 CALLBACK] Token exchange failed:", tokenResponse.status, errorBody);
            return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
        }

        tokens = (await tokenResponse.json()) as TokenResponse;

        // --- Diagnostic: log what the auth server actually returned ---
        console.log("[SSO Logout] [Next.js CALLBACK] Token response received:", {
            has_access_token: !!tokens.access_token,
            has_id_token: !!tokens.id_token,
            has_refresh_token: !!tokens.refresh_token,
            token_type: tokens.token_type,
            expires_in: tokens.expires_in,
            // Log first 40 chars of id_token for tracing (not sensitive — it's a signed JWT, not a secret)
            id_token_preview: tokens.id_token ? tokens.id_token.substring(0, 40) + "..." : "MISSING",
        });
    } catch (err) {
        console.error("[OAUTH2 CALLBACK] Token exchange exception:", err);
        return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
    }

    if (!tokens.access_token) {
        console.error("[OAUTH2 CALLBACK] No access_token in response");
        return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
    }

    // Validate id_token claims. The token was received server-to-server so we
    // trust the signature implicitly, but we still verify the basic OIDC claims
    // (iss, aud, exp) and the nonce to prevent replay.
    if (tokens.id_token) {
        console.log("[SSO Logout] [Next.js CALLBACK] id_token is present — validating claims...");
        const claims = parseJwtPayload(tokens.id_token);
        const expectedIssuer = process.env.AUTH_SERVER_BASE_URL || "http://localhost:9000";
        const now = Math.floor(Date.now() / 1000);

        if (!claims) {
            console.error("[OAUTH2 CALLBACK] id_token payload could not be parsed");
            return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
        }

        console.log("[SSO Logout] [Next.js CALLBACK] id_token claims:", {
            iss: claims["iss"],
            aud: claims["aud"],
            aud_type: Array.isArray(claims["aud"]) ? "array" : typeof claims["aud"],
            exp: claims["exp"],
            has_nonce: !!claims["nonce"],
            expected_iss: expectedIssuer,
            expected_aud: CLIENT_ID,
        });

        if (claims["iss"] !== expectedIssuer) {
            console.error("[OAUTH2 CALLBACK] id_token iss mismatch — got:", claims["iss"], "expected:", expectedIssuer);
            return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
        }
        // aud can be a string or an array per the JWT spec (Spring SAS issues it as an array)
        const aud = claims["aud"];
        const audMatches = Array.isArray(aud) ? aud.includes(CLIENT_ID) : aud === CLIENT_ID;
        if (!audMatches) {
            console.error("[OAUTH2 CALLBACK] id_token aud mismatch — got:", aud, "expected:", CLIENT_ID);
            return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
        }
        if (typeof claims["exp"] === "number" && claims["exp"] < now) {
            console.error("[OAUTH2 CALLBACK] id_token is expired — exp:", claims["exp"], "now:", now);
            return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
        }
        if (storedNonce && claims["nonce"] !== storedNonce) {
            console.error("[OAUTH2 CALLBACK] id_token nonce mismatch — possible replay attack");
            return NextResponse.redirect(new URL(`/api/auth/login`, APP_BASE_URL).toString());
        }
        console.log("[SSO Logout] [Next.js CALLBACK] id_token validation passed.");
    } else {
        console.warn("[SSO Logout] [Next.js CALLBACK] WARNING: Auth server did NOT return an id_token. Front-channel logout will not work. Check that the 'openid' scope is requested and authorized for nextjs-app.");
    }

    const redirectTarget = next.startsWith("/") ? next : "/admin/dashboard";
    const response = NextResponse.redirect(new URL(redirectTarget, request.url));

    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
        ...tokenCookieOptions,
        maxAge: tokens.expires_in ?? ACCESS_TOKEN_MAX_AGE,
    });

    if (tokens.id_token) {
        response.cookies.set(ID_TOKEN_COOKIE, tokens.id_token, {
            ...tokenCookieOptions,
            // Use refresh token TTL (30 days) so the id_token survives for the
            // full session lifetime. It is only used as id_token_hint on logout
            // and is not used for API authorization, so a longer TTL is safe.
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });
        console.log("[SSO Logout] [Next.js CALLBACK] id_token cookie saved (30-day TTL). Logout will use RP-Initiated Logout.");
    } else {
        console.warn("[SSO Logout] [Next.js CALLBACK] id_token cookie NOT saved — logout will fall back to local cookie clear only.");
    }

    if (tokens.refresh_token) {
        response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
            ...tokenCookieOptions,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });
    }

    // Clean up PKCE, state, and nonce cookies
    response.cookies.delete(PKCE_COOKIE);
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(NONCE_COOKIE);

    return response;
}
