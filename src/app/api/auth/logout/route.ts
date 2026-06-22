import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVER_BASE_URL = process.env.AUTH_SERVER_BASE_URL || "http://localhost:9000";

const ACCESS_TOKEN_COOKIE = "auth_server_access_token";
const REFRESH_TOKEN_COOKIE = "auth_server_refresh_token";
const ID_TOKEN_COOKIE = "auth_server_id_token";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const idToken = cookieStore.get(ID_TOKEN_COOKIE)?.value;

    if (!idToken) {
        // No id_token available — clear local cookies and send the browser to
        // the auth server login page directly.
        const response = NextResponse.redirect(new URL("/login", AUTH_SERVER_BASE_URL));
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);
        response.cookies.delete(ID_TOKEN_COOKIE);
        return response;
    }

    // Full RP-Initiated Logout: Spring SAS validates the id_token_hint, revokes
    // the authorization record (SSO session destroyed), then redirects to its
    // own /login?logout page. post_logout_redirect_uri is intentionally omitted
    // so the browser always lands on the auth server login form after logout.
    const logoutUrl = new URL(`${AUTH_SERVER_BASE_URL}/connect/logout`);
    logoutUrl.searchParams.set("id_token_hint", idToken);

    const response = NextResponse.redirect(logoutUrl.toString());
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    response.cookies.delete(ID_TOKEN_COOKIE);

    return response;
}
