import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import UserSchema from "@/models/UserSchema";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    const exist = await UserSchema.findOne({ email });
    if (exist) return NextResponse.json({ message: "Email already exists" }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);

    const user = await UserSchema.create({ name, email, password: hash, role });

    return NextResponse.json({ message: "User registered successfully", user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
