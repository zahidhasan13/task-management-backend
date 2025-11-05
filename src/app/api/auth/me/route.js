// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import UserSchema from "@/models/UserSchema";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserSchema.findById(decoded.id).select("-password");

    if (!user) return NextResponse.json({ user: null }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
