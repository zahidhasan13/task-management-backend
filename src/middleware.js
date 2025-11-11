import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const origin = req.headers.get("origin");
  const response = NextResponse.next();

  // === ✅ Allow Any Origin (but still support cookies) ===
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // === ✅ Auth Control ===
  const publicPaths = ["/login", "/signup"];

  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public|api).*)"],
};
