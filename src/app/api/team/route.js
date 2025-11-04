import { connectDB } from "@/lib/db";
import TeamSchema from "@/models/TeamSchema";
import UserSchema from "@/models/UserSchema";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";



export async function GET(req) {
  try {
    await connectDB();

    // Get token from header
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch teams where user is a member
    const teams = await TeamSchema.find({ members: userId })
      .populate("captain")   // fetch all captain info
      .populate("members");  // fetch all members info

    return NextResponse.json({ message: "Teams fetched successfully", teams }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch teams", error: error.message },
      { status: 500 }
    );
  }
}


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

    // Check if a team with the same name already exists
    const existingTeam = await TeamSchema.findOne({ name });
    if (existingTeam) {
      return NextResponse.json({ message: "Team name already exists" }, { status: 400 });
    }

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