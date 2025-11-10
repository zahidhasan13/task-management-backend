import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import UserSchema from "@/models/UserSchema";
import TeamSchema from "@/models/TeamSchema";

export async function POST(req) {
  try {
    await connectDB();
    const { teamId, memberEmail } = await req.json();
    console.log(teamId,memberEmail,"hhh")

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const team = await TeamSchema.findById(teamId).populate("members", "name email");
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });

    if (team.captain.toString() !== userId)
      return NextResponse.json({ message: "Only the captain can add members" }, { status: 403 });

    const member = await UserSchema.findOne({ email: memberEmail });
    if (!member) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (team.members.find((m) => m._id.toString() === member._id.toString()))
      return NextResponse.json({ message: "User is already a team member" }, { status: 400 });

    team.members.push(member._id);
    await team.save();

    // Populate members again for response
    await team.populate("members", "name email");

    return NextResponse.json({ message: "Member added successfully", team }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to add member", error: error.message }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    await connectDB();

    const { teamId, memberId } = await req.json();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const team = await TeamSchema.findById(teamId);
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });

    if (team.captain.toString() !== userId)
      return NextResponse.json({ message: "Only captain can remove members" }, { status: 403 });

    if (memberId.toString() === userId.toString())
      return NextResponse.json({ message: "Captain cannot remove himself" }, { status: 400 });

    if (!team.members.some((id) => id.toString() === memberId.toString()))
      return NextResponse.json({ message: "Member not in team" }, { status: 400 });

    team.members = team.members.filter((id) => id.toString() !== memberId.toString());
    await team.save();

    return NextResponse.json({ message: "Member removed successfully", team }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to remove member", error: error.message }, { status: 500 });
  }
}
