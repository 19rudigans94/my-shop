import { NextResponse } from "next/server";

async function getExpectedToken() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(process.env.ADMIN_SESSION_SECRET);
  const messageData = encoder.encode(process.env.ADMIN_PASSWORD);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isAuthApi = pathname.startsWith("/api/admin/auth");

  if (isLoginPage || isAuthApi) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedApi =
    pathname.startsWith("/api/protected") ||
    pathname.startsWith("/api/admin");

  if (!isAdminPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("admin_session")?.value;
  const expectedToken = await getExpectedToken();

  if (sessionCookie !== expectedToken) {
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/protected/:path*", "/api/admin/:path*"],
};
