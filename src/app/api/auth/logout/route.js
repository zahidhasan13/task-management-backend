import { NextResponse } from "next/server";

export async function GET(req) {
  const res = NextResponse.redirect(new URL("/login", req.url));

  // Clear the token cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // expire immediately
  });

  return res;
}
