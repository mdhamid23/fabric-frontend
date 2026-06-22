import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_SERVER_BASE_URL = process.env.AUTH_SERVER_BASE_URL || "http://localhost:9000";

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID || "nextjs-app";
const OAUTH2_CLIENT_SECRET = process.env.OAUTH2_CLIENT_SECRET || "changeme";

const ACCESS_TOKEN_COOKIE = "auth_server_access_token";
const REFRESH_TOKEN_COOKIE = "auth_server_refresh_token";

const ACCESS_TOKEN_MAX_AGE_FALLBACK = 60 * 60; // 1 hour
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const DEBUG_AUTH = true;

const cookieOptions = {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};

type RefreshTokenResponse = {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
};

type AuthDebug = {
    step: string;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    accessTokenPreview?: string;
    refreshTokenPreview?: string;
    authServerBaseUrl: string;
    currentUserStatus?: number;
    refreshStatus?: number;
    refreshedCurrentUserStatus?: number;
    error?: string;
    responseBody?: unknown;
};

function tokenPreview(token?: string) {
    if (!token) return undefined;
    return token;
}

async function safeReadJson(response: Response) {
    try {
        return await response.clone().json();
    } catch {
        try {
            return await response.clone().text();
        } catch {
            return null;
        }
    }
}

async function fetchCurrentUser(accessToken: string) {
    return fetch(`${BACKEND_API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
        cache: "no-store",
    });
}

async function refreshTokens(refreshToken: string) {
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    });

    // Use client_secret_basic to match the registered client_authentication_methods.
    const basicCredentials = Buffer.from(`${OAUTH2_CLIENT_ID}:${OAUTH2_CLIENT_SECRET}`).toString("base64");

    return fetch(`${AUTH_SERVER_BASE_URL}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${basicCredentials}`,
            Accept: "application/json",
        },
        body: body.toString(),
        cache: "no-store",
    });
}

function debugResponse(debug: AuthDebug, status = 401) {
    console.log("[AUTH DEBUG]", JSON.stringify(debug, null, 2));

    return NextResponse.json(
        {
            authenticated: false,
            debug,
        },
        { status },
    );
}

function unauthenticatedResponse(debug: AuthDebug, status = 401) {
    console.log("[AUTH FAILED]", JSON.stringify(debug, null, 2));

    const response = NextResponse.json(
        DEBUG_AUTH
            ? {
                  authenticated: false,
                  debug,
              }
            : {
                  authenticated: false,
              },
        { status },
    );

    // During debugging, do not delete cookies.
    if (!DEBUG_AUTH) {
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);
    }

    return response;
}

function authenticatedResponse(user: unknown) {
    return NextResponse.json(
        {
            authenticated: true,
            user,
        },
        { status: 200 },
    );
}

export async function GET() {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    const debug: AuthDebug = {
        step: "start",
        hasAccessToken: Boolean(accessToken),
        hasRefreshToken: Boolean(refreshToken),
        accessTokenPreview: tokenPreview(accessToken),
        refreshTokenPreview: tokenPreview(refreshToken),
        authServerBaseUrl: AUTH_SERVER_BASE_URL,
    };

    try {
        if (!accessToken && !refreshToken) {
            debug.step = "missing_both_tokens";
            return unauthenticatedResponse(debug);
        }

        if (accessToken) {
            debug.step = "checking_current_user_with_access_token";

            const userResponse = await fetchCurrentUser(accessToken);
            debug.currentUserStatus = userResponse.status;

            if (userResponse.ok) {
                debug.step = "current_user_success";

                console.log("[AUTH SUCCESS]", JSON.stringify(debug, null, 2));

                const data = await userResponse.json();
                const user = data?.user ?? data;
                return authenticatedResponse(user);
            }

            debug.responseBody = await safeReadJson(userResponse);

            if (userResponse.status !== 401) {
                debug.step = "current_user_failed_non_401";
                return unauthenticatedResponse(debug, userResponse.status);
            }

            if (!refreshToken) {
                debug.step = "access_token_401_and_missing_refresh_token";
                return unauthenticatedResponse(debug);
            }

            debug.step = "access_token_401_trying_refresh";
        }

        if (!refreshToken) {
            debug.step = "missing_refresh_token";
            return unauthenticatedResponse(debug);
        }

        const refreshed = await refreshTokens(refreshToken);
        debug.refreshStatus = refreshed.status;

        if (!refreshed.ok) {
            debug.step = "refresh_failed";
            debug.responseBody = await safeReadJson(refreshed);
            return unauthenticatedResponse(debug, refreshed.status);
        }

        const tokenBody = (await refreshed.json()) as RefreshTokenResponse;

        if (!tokenBody.access_token) {
            debug.step = "refresh_success_but_access_token_missing";
            debug.responseBody = tokenBody;
            return unauthenticatedResponse(debug);
        }

        debug.step = "refresh_success_checking_current_user_again";

        const userResponse = await fetchCurrentUser(tokenBody.access_token);
        debug.refreshedCurrentUserStatus = userResponse.status;

        if (!userResponse.ok) {
            debug.step = "current_user_failed_after_refresh";
            debug.responseBody = await safeReadJson(userResponse);
            return unauthenticatedResponse(debug, userResponse.status);
        }

        const data = await userResponse.json();
        const user = data?.user ?? data;

        const response = authenticatedResponse(user);

        response.cookies.set(ACCESS_TOKEN_COOKIE, tokenBody.access_token, {
            ...cookieOptions,
            maxAge: tokenBody.expires_in || ACCESS_TOKEN_MAX_AGE_FALLBACK,
        });

        response.cookies.set(REFRESH_TOKEN_COOKIE, tokenBody.refresh_token || refreshToken, {
            ...cookieOptions,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        debug.step = "authenticated_after_refresh";
        console.log("[AUTH SUCCESS]", JSON.stringify(debug, null, 2));

        return response;
    } catch (error) {
        debug.step = "unexpected_exception";
        debug.error = error instanceof Error ? error.message : String(error);

        return debugResponse(debug, 500);
    }
}
