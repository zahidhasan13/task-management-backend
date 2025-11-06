import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TeamSchema from "@/models/TeamSchema";
import mongoose from "mongoose";

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
