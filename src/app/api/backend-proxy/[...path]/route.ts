import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

const ACCESS_TOKEN_COOKIE = "auth_server_access_token";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const { path } = await context.params;

  const backendPath = path.join("/");
  const targetUrl = new URL(`${BACKEND_API_BASE_URL}/${backendPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log("[BACKEND PROXY HIT]", {
    incomingPath: request.nextUrl.pathname,
    targetUrl: targetUrl.toString(),
    hasAccessToken: Boolean(accessToken),
    tokenPreview: accessToken
      ? `${accessToken.slice(0, 16)}...${accessToken.slice(-8)}`
      : null,
  });

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Unauthorized: missing access token",
      },
      { status: 401 },
    );
  }

  const headers = new Headers(request.headers);

  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Accept", "application/json");

  headers.delete("host");
  headers.delete("cookie");
  headers.delete("content-length");

  const method = request.method.toUpperCase();

  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const backendResponse = await fetch(targetUrl.toString(), {
    method,
    headers,
    body,
    cache: "no-store",
  });

  console.log("[BACKEND PROXY RESPONSE]", {
    targetUrl: targetUrl.toString(),
    status: backendResponse.status,
  });

  const responseBody = await backendResponse.arrayBuffer();

  const responseHeaders = new Headers(backendResponse.headers);

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
