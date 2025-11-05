// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import UserSchema from "@/models/UserSchema";

export async function GET(req) {
  try {
    await connectDB();

    // ✅ Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null, token: null }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ user: null, token: null }, { status: 401 });
    }

    // ✅ Fetch user from DB without password
    const user = await UserSchema.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ user: null, token: null }, { status: 404 });
    }

    return NextResponse.json({ user, token });

  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ user: null, token: null }, { status: 500 });
  }
}
