import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Task from "@/models/TaskSchema";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const task = await Task.findById(params.taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("team", "name");

    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

    return NextResponse.json({ task }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch task", error: error.message },
      { status: 500 }
    );
  }
}
