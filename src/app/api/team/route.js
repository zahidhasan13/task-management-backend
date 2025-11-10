import { connectDB } from "@/lib/db";
import TeamSchema from "@/models/TeamSchema";
import UserSchema from "@/models/UserSchema";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    await connectDB();

    // ✅ Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

   // ✅ Fetch teams where user is a member
const teams = await TeamSchema.find({ members: userId })
  .populate({
    path: "captain",
    select: "-password -__v", // exclude password and version
  })
  .populate({
    path: "members",
    select: "-password -__v", // exclude password and version
  });


    return NextResponse.json(
      { message: "Teams fetched successfully", teams },
      { status: 200 }
    );
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
    console.log(req.headers,"token")
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

// Patch
export async function PATCH(req) {
  try {
    await connectDB();

    // Get data from request body
    const { teamId, name } = await req.json();
    if (!teamId || !name)
      return NextResponse.json({ message: "teamId and name are required" }, { status: 400 });

    // Get token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find team
    const team = await TeamSchema.findById(teamId);
    if (!team)
      return NextResponse.json({ message: "Team not found" }, { status: 404 });

    // Only captain can update
    if (team.captain.toString() !== userId)
      return NextResponse.json({ message: "Only captain can update team" }, { status: 403 });

    // Update name
    team.name = name;
    await team.save();

    return NextResponse.json({ message: "Team updated successfully", team }, { status: 200 });
  } catch (error) {
    console.error("PATCH team error:", error);
    return NextResponse.json(
      { message: "Team update failed", error: error.message },
      { status: 500 }
    );
  }
}


// Delte
export async function DELETE(req) {
  try {
    await connectDB();

    // Get data from request body
    const { teamId } = await req.json();
    if (!teamId) return NextResponse.json({ message: "No teamId provided" }, { status: 400 });

    console.log("Deleting team:", teamId);

    // Get token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find team
    const team = await TeamSchema.findById(teamId);
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });

    // Only captain can delete
    if (team.captain.toString() !== userId) {
      return NextResponse.json({ message: "Only captain can delete team" }, { status: 403 });
    }

    // Delete the team
    await TeamSchema.findByIdAndDelete(teamId);

    return NextResponse.json({ message: "Team deleted successfully", teamId }, { status: 200 });
  } catch (error) {
    console.error("DELETE team error:", error);
    return NextResponse.json({ message: "Team deletion failed", error: error.message }, { status: 500 });
  }
}
