import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import TaskSchema from "@/models/TaskSchema";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // ✅ Await the params promise
    const { taskId } = await params;
    
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const task = await TaskSchema.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("team", "name");

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });

  } catch (error) {
    console.error("GET Task Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch task", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    // ✅ Await the params promise
    const { taskId } = await params;
    
    console.log("Task ID:", taskId);

    // ✅ Get token from headers
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }

    // ✅ Verify token and get decoded data
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 401 }
      );
    }
    
    if (!taskId) {
      return NextResponse.json({ message: "Task ID is required." }, { status: 400 });
    }

    // ✅ Validate taskId format
    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      return NextResponse.json({ message: "Invalid task ID format." }, { status: 400 });
    }

    // ✅ Get updates from URL search params instead of request body
    const { searchParams } = new URL(req.url);
    const updates = {};
    
    // ✅ Extract and parse parameters from search params
    const title = searchParams.get('title');
    const description = searchParams.get('description');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const dueDate = searchParams.get('dueDate');
    const assignedTo = searchParams.get('assignedTo');

    // ✅ Only add defined parameters to updates object
    if (title !== null) updates.title = title;
    if (description !== null) updates.description = description;
    if (priority !== null) updates.priority = priority;
    if (status !== null) updates.status = status;
    if (dueDate !== null) updates.dueDate = dueDate;
    if (assignedTo !== null) updates.assignedTo = assignedTo;

    console.log("Updates from search params:", updates);

    // ✅ Validate updates object
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No updates provided." }, { status: 400 });
    }

    // ✅ Find task
    const task = await TaskSchema.findById(taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }

    // ✅ Authorization check - only creator can update
    if (task.createdBy.toString() !== decoded.id) {
      return NextResponse.json(
        { message: "You are not authorized to update this task." },
        { status: 403 }
      );
    }

    // ✅ Update allowed fields with validation
    const allowedFields = ["title", "description", "priority", "status", "dueDate", "assignedTo"];
    const invalidFields = [];
    
    Object.keys(updates).forEach((field) => {
      if (allowedFields.includes(field)) {
        // Basic validation for required fields
        if (field === "title" && (!updates[field] || updates[field].trim() === "")) {
          invalidFields.push("Title cannot be empty");
        } else if (field === "assignedTo" && !/^[0-9a-fA-F]{24}$/.test(updates[field])) {
          invalidFields.push("Invalid assignedTo user ID format");
        } else if (field === "dueDate" && isNaN(new Date(updates[field]))) {
          invalidFields.push("Invalid due date format");
        } else if (field === "priority" && !["low", "medium", "high", "critical"].includes(updates[field])) {
          invalidFields.push("Priority must be one of: low, medium, high, critical");
        } else if (field === "status" && !["pending", "in_progress", "completed", "cancelled"].includes(updates[field])) {
          invalidFields.push("Status must be one of: pending, in_progress, completed, cancelled");
        } else {
          task[field] = updates[field];
        }
      } else {
        invalidFields.push(`Field '${field}' is not allowed to be updated`);
      }
    });

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { message: "Validation failed", errors: invalidFields },
        { status: 400 }
      );
    }

    // ✅ Set updatedAt timestamp
    task.updatedAt = new Date();

    await task.save();

    // ✅ Populate the updated task before sending response
    const updatedTask = await TaskSchema.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("team", "name");

    return NextResponse.json({ 
      message: "Task updated successfully", 
      task: updatedTask 
    }, { status: 200 });

  } catch (error) {
    console.error("PATCH Task Error:", error);
    return NextResponse.json(
      { message: "Failed to update task", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // ✅ Await the params promise
    const { taskId } = await params;

    // ✅ Get token from headers
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }

    // ✅ Verify token and get decoded data
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 401 }
      );
    }
    
    if (!taskId) {
      return NextResponse.json({ message: "Task ID is required." }, { status: 400 });
    }

    // ✅ Validate taskId format
    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      return NextResponse.json({ message: "Invalid task ID format." }, { status: 400 });
    }

    // ✅ Find task
    const task = await TaskSchema.findById(taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }

    // ✅ Authorization check - only creator can delete
    if (task.createdBy.toString() !== decoded.id) {
      return NextResponse.json(
        { message: "You are not authorized to delete this task." },
        { status: 403 }
      );
    }

    // ✅ Delete the task
    await TaskSchema.findByIdAndDelete(taskId);

    return NextResponse.json({ 
      message: "Task deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("DELETE Task Error:", error);
    return NextResponse.json(
      { message: "Failed to delete task", error: error.message },
      { status: 500 }
    );
  }
}