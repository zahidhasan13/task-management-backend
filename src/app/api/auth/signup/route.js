import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import UserSchema from "@/models/UserSchema";

export async function POST(req) {
  try {
    await connectDB();

    // Parse JSON body
    const { name, email, password } = await req.json();
    console.log("Signup data:", name, email, password);
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }


    // Check if user exists
    const exist = await UserSchema.findOne({ email });
    if (exist) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await UserSchema.create({
      name,
      email,
      password: hash,
      role: "member", // default role
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
  }
}
