"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { createTask, fetchTasks } from "@/redux/slices/taskSlice";
import { AlignLeft, Calendar, FileText, Flag, User } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function TaskModal({ show, close, teamId, members }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.task);

  // ✅ Prevent crash if members is undefined
  const safeMembers = Array.isArray(members) ? members : [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [memberId, setMemberId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreateTask = () => {
    if (!title || !description || !memberId || !dueDate) {
      return alert("Please fill all required fields");
    }

    dispatch(
      createTask({
        title,
        description,
        priority,
        dueDate,
        team: teamId,
        assignedTo: memberId,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(fetchTasks(teamId));
        close();

        setTitle("");
        setDescription("");
        setPriority("medium");
        setMemberId("");
        setDueDate("");

        alert("✅ Task Created Successfully");
      })
      .catch((err) => {
        console.error("❌ Task creation failed:", err);
        alert(`Error: ${err}`);
      });
  };

  const getPriorityColor = (value) => {
    const colors = {
      low: "text-green-600 bg-green-50 border-green-200",
      medium: "text-amber-600 bg-amber-50 border-amber-200",
      high: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[value] || "";
  };

  return (
    show && (
      <Modal title="Create New Task" close={close}>
        <div className="space-y-5">
          {/* Task Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Task Title
            </label>
            <input
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-blue-600" />
              Description
            </label>
            <textarea
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Flag className="w-4 h-4 text-blue-600" />
              Priority Level
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getPriorityColor(
                priority
              )}`}
            >
              <Flag className="w-3 h-3" />
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </div>
          </div>

          {/* Assign To Member */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Assign To
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Select a team member</option>

              {safeMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} • {m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <Button label="Create Task" onClick={handleCreateTask} loading={loading} />
          </div>
        </div>
      </Modal>
    )
  );
}
