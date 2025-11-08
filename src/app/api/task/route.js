import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Task from "@/models/TaskSchema";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const userId = decoded.id; // Logged-in user

    if (!teamId) {
      return NextResponse.json({ message: "teamId is required" }, { status: 400 });
    }

    let tasks;

    // ✅ If Captain → show all team tasks
    if (decoded.role === "captain") {
      tasks = await Task.find({ team: teamId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .populate("team", "name");
    } 
    // ✅ If Team Member → show only tasks assigned to them
    else {
      tasks = await Task.find({ team: teamId, assignedTo: userId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .populate("team", "name");
    }

    return NextResponse.json({ tasks }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch tasks", error: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { title, description, priority, dueDate, team, assignedTo } = await req.json();

    if (!title || !description || !team || !assignedTo || !dueDate) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      team,
      assignedTo,
      createdBy: decoded.id,
    });

    return NextResponse.json({ task }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create task", error: error.message },
      { status: 500 }
    );
  }
}
