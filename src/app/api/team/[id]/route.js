import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TeamSchema from "@/models/TeamSchema";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // get last part of path
    console.log("Team ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid Team ID" }, { status: 400 });
    }

    const team = await TeamSchema.findById(id)
      .populate("captain", "name email")
      .populate("members", "name email");

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Team fetched successfully", team },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { name } = await req.json();

    // Get token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find team
    const team = await TeamSchema.findById(id);
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });

    // Check captain permission
    if (team.captain.toString() !== userId) {
      return NextResponse.json({ message: "Only captain can update team" }, { status: 403 });
    }

    // Prevent duplicate team names
    const existing = await TeamSchema.findOne({ name });
    if (existing && existing._id.toString() !== id) {
      return NextResponse.json({ message: "Team name already exists" }, { status: 400 });
    }

    team.name = name;
    await team.save();

    return NextResponse.json({ message: "Team updated successfully", team }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Team update failed", error: error.message }, { status: 500 });
  }
}


