import { connectDB } from "@/lib/db";
import UserSchema from "@/models/UserSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const origin = req.headers.get("origin") || "*";

    // Parse JSON body
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields are required" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        }
      });
    }

    // Check if user exists
    const exist = await UserSchema.findOne({ email });
    if (exist) {
      return new Response(JSON.stringify({ message: "Email already exists" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        }
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await UserSchema.create({
      name,
      email,
      password: hash,
      role: "member",
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response object
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

    // Set cookie for cross-origin usage
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,       // REQUIRED for cross-origin cookies
      sameSite: "none",   // REQUIRED for cross-origin cookies
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Set CORS headers
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: error.message || "Server error" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

// ✅ Handle CORS Preflight
export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "*";

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
