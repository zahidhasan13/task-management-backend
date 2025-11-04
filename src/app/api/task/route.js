import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import TaskSchema from "@/models/TaskSchema";
import TeamSchema from "@/models/TeamSchema";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get all tasks assigned to this member
    const tasks = await TaskSchema.find({ assignedTo: userId })
      .populate("assignedBy", "name email") // captain info
      .populate("team", "name"); // team info

    return NextResponse.json({ message: "Tasks fetched successfully", tasks }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch tasks", error: error.message }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    await connectDB();

    const { teamId, memberId, title, description, priority, dueDate } = await req.json();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const team = await TeamSchema.findById(teamId);
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });

    // Only captain can assign tasks
    if (team.captain.toString() !== userId)
      return NextResponse.json({ message: "Only captain can assign tasks" }, { status: 403 });

    // Check if member belongs to team
    if (!team.members.includes(memberId))
      return NextResponse.json({ message: "Member not in team" }, { status: 400 });

    const task = await TaskSchema.create({
      title,
      description,
      priority,
      assignedTo: memberId,
      createdBy: userId,
      team: teamId,
      dueDate,
    });

    return NextResponse.json({ message: "Task assigned successfully", task }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to assign task", error: error.message }, { status: 500 });
  }
}
