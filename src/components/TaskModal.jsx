"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "@/redux/slices/taskSlice";
import { fetchTasks } from "@/redux/slices/taskSlice";

export default function TaskModal({ show, close, teamId, members }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.task);

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
        team: teamId,          // ✅ correct field
        assignedTo: memberId,  // ✅ correct field
      })
    )
      .unwrap()
      .then(() => {
        alert("✅ Task Created Successfully");

        // ✅ Refresh task list for UI update
        dispatch(fetchTasks(teamId));

        close();

        // ✅ Reset form
        setTitle("");
        setDescription("");
        setPriority("medium");
        setMemberId("");
        setDueDate("");
      })
      .catch((err) => {
        console.error("❌ Task creation failed:", err);
        alert(`Error: ${err}`);
      });
  };

  return (
    show && (
      <Modal title="Create Task" close={close}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 mb-4"
        />

        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 mb-4"
        />

        <select
          className="w-full border p-2 mb-4"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <select
          className="w-full border p-2 mb-4"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
        >
          <option value="">Select Member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border p-2 mb-4"
        />

        <Button label="Create Task" onClick={handleCreateTask} loading={loading} />
      </Modal>
    )
  );
}
