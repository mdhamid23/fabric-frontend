import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  // Get token from Authorization header only
  const authHeader = request.headers.get("authorization");
  let accessToken: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.substring(7); // Remove "Bearer " prefix
  }

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

  // Uncomment this if you want to require authentication
  // if (!accessToken) {
  //   return NextResponse.json(
  //     {
  //       message: "Unauthorized: missing access token",
  //     },
  //     { status: 401 },
  //   );
  // }

  const headers = new Headers(request.headers);

  // Forward the Authorization header to the backend
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  headers.set("Accept", "application/json");

  // Remove headers that might cause issues
  headers.delete("host");
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

  // Clean up response headers
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
