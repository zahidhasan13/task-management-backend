import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import UserSchema from "@/models/UserSchema";
import TeamSchema from "@/models/TeamSchema";

export async function POST(req) {
  try {
    await connectDB();

    const { name } = await req.json();
    
    // Get token from header
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Make this user captain if not already
    await UserSchema.findByIdAndUpdate(userId, { role: "captain" });

    // Create team
    const team = await TeamSchema.create({
      name,
      captain: userId,
      members: [userId] // Captain always added to members list
    });

    return NextResponse.json(
      { message: "Team created successfully", team },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Team creation failed", error: error.message },
      { status: 500 }
    );
  }
}