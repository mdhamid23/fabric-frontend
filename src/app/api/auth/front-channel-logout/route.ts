import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "auth_server_access_token";
const REFRESH_TOKEN_COOKIE = "auth_server_refresh_token";
const ID_TOKEN_COOKIE = "auth_server_id_token";

/**
 * OIDC Front-Channel Logout endpoint.
 *
 * The auth server loads this URL inside a hidden <iframe> whenever any SSO
 * client (e.g. the Laravel app) initiates RP-Initiated Logout. The browser
 * sends the Next.js cookies with the iframe request, so responding with
 * Set-Cookie deletion headers here clears the local session — achieving
 * cross-app SSO logout without requiring the user to visit this app first.
 *
 * Requirements per the OIDC Front-Channel Logout spec:
 *   - Must accept GET (iframes use GET, not POST)
 *   - Must return 200 with a body (a redirect would be ignored by the iframe)
 *   - No CSRF token is available (Next.js Route Handlers don't enforce one)
 */
export async function GET(request: Request) {
    const callerIp = request.headers.get("x-forwarded-for") ?? "unknown";
    console.log(`[SSO Logout] [Next.js STEP 5] Front-channel logout iframe request received from ${callerIp}.`);
    console.log("[SSO Logout] [Next.js STEP 5] Auth server loaded this URL in a hidden iframe to clear the Next.js session.");

    const response = new NextResponse(null, { status: 200 });

    // Delete all local auth cookies. If the user isn't logged in these are
    // no-ops — the endpoint is safe to call unconditionally.
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    response.cookies.delete(ID_TOKEN_COOKIE);

    console.log("[SSO Logout] [Next.js STEP 5] Auth cookies cleared. Returning 200 to auth server iframe page.");
    return response;
}
