import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import UserSchema from "@/models/UserSchema";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await UserSchema.findOne({ email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return NextResponse.json({ message: "Invalid password" }, { status: 400 });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
