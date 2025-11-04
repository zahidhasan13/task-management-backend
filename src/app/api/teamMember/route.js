import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import UserSchema from "@/models/UserSchema";
import TeamSchema from "@/models/TeamSchema";

export async function POST(req) {
  try {
    await connectDB();

    const { teamId, memberEmail } = await req.json();

    // Get token from header
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the team
    const team = await TeamSchema.findById(teamId);
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });

    // Check if current user is the captain
    if (team.captain.toString() !== userId)
      return NextResponse.json({ message: "Only the captain can add members" }, { status: 403 });

    // Find the member by email
    const member = await UserSchema.findOne({ email: memberEmail });
    if (!member) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Check if member is already in team
    if (team.members.includes(member._id))
      return NextResponse.json({ message: "User is already a team member" }, { status: 400 });

    // Add member to the team
    team.members.push(member._id);
    await team.save();

    return NextResponse.json({ message: "Member added successfully", team }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add member", error: error.message },
      { status: 500 }
    );
  }
}
