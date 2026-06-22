import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVER_BASE_URL = process.env.AUTH_SERVER_BASE_URL || "http://localhost:9000";

const CLIENT_ID = process.env.OAUTH2_CLIENT_ID || "nextjs-app";

const REDIRECT_URI = process.env.OAUTH2_REDIRECT_URI || "http://localhost:3000/api/auth/callback";

const SCOPES = "openid profile email roles";

const PKCE_COOKIE = "pkce_verifier";
const STATE_COOKIE = "oauth2_state";
const NONCE_COOKIE = "oauth2_nonce";

const secureCookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes — long enough to complete the auth redirect
};

function generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
    return crypto.createHash("sha256").update(verifier).digest("base64url");
}

function generateState(): string {
    return crypto.randomBytes(16).toString("hex");
}

function generateNonce(): string {
    return crypto.randomBytes(16).toString("hex");
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/admin/dashboard";

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();
    const nonce = generateNonce();

    const authorizeUrl = new URL(`${AUTH_SERVER_BASE_URL}/oauth2/authorize`);
    authorizeUrl.searchParams.set("client_id", CLIENT_ID);
    authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", SCOPES);
    authorizeUrl.searchParams.set("code_challenge", codeChallenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("nonce", nonce);

    const response = NextResponse.redirect(authorizeUrl.toString());

    response.cookies.set(PKCE_COOKIE, codeVerifier, secureCookieOptions);
    response.cookies.set(STATE_COOKIE, `${state}:${next}`, secureCookieOptions);
    response.cookies.set(NONCE_COOKIE, nonce, secureCookieOptions);

    return response;
}
