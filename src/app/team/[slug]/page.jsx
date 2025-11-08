"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTeamMember, getSingleTeam } from "@/redux/slices/teamSlice";
import { useParams } from "next/navigation";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import TaskModal from "@/components/TaskModal";
import { fetchTasks } from "@/redux/slices/taskSlice";

export default function TeamPage() {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [expandedMember, setExpandedMember] = useState(null); // 👈 for toggle

  const dispatch = useDispatch();
  const { slug } = useParams(); // dynamic route param

  const { singleTeam, loading, error } = useSelector((state) => state.team);
  const { tasks } = useSelector((state) => state.task);
  console.log(singleTeam,"tsaks")
  console.log(tasks,"tsaksss")

  // Fetch single team + team tasks
  useEffect(() => {
    if (!slug) return;
    dispatch(getSingleTeam(slug));
  }, [slug, dispatch]);

  useEffect(() => {
    if (singleTeam?._id) {
      dispatch(fetchTasks(singleTeam?._id)); // fetch all tasks for this team
    }
  }, [singleTeam, dispatch]);

  // Handle Add Member
  const handleAddMember = () => {
    if (!memberEmail) return alert("Enter member email");

    dispatch(addTeamMember({ memberEmail, teamId: singleTeam._id }))
      .unwrap()
      .then(() => {
        alert("Member added ✅");
        setShowAddMemberModal(false);
        setMemberEmail("");
        dispatch(getSingleTeam(slug)); // Refresh team members
      })
      .catch((err) => alert(err));
  };

  // Filter tasks for a specific member
  const getMemberTasks = (memberId) => {
    return tasks.filter((task) => task.assignedTo?._id === memberId);
  };

  if (loading) return <p className="p-6">Loading Team...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!singleTeam) return <p className="p-6">Team not found.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Team Header */}
      <div className="border p-4 rounded shadow-sm bg-white">
        <h1 className="text-2xl font-bold">{singleTeam.name}</h1>
        <p className="text-gray-600 text-sm">
          Captain:{" "}
          <span className="font-semibold">{singleTeam.captain?.name}</span>
        </p>
      </div>

      {/* Team Members */}
      <div className="border p-4 rounded shadow-sm bg-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Team Members</h2>
          <button
            className="bg-green-500 px-3 py-1 text-white text-sm rounded hover:bg-green-600"
            onClick={() => setShowAddMemberModal(true)}
          >
            Add Member
          </button>
        </div>

        {!singleTeam.members || singleTeam.members.length === 0 ? (
          <p className="text-gray-500">No members yet.</p>
        ) : (
          <ul className="space-y-3">
            {singleTeam.members.map((m) => (
              <li
                key={m._id}
                className="border rounded p-3 bg-gray-50 hover:bg-gray-100"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setExpandedMember(expandedMember === m._id ? null : m._id)
                  }
                >
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-gray-600">{m.email}</p>
                  </div>
                  <span className="text-sm text-blue-600">
                    {expandedMember === m._id ? "▲ Hide Tasks" : "▼ Show Tasks"}
                  </span>
                </div>

                {/* Tasks under each member */}
                {expandedMember === m._id && (
                  <div className="mt-3 border-t pt-2">
                    {getMemberTasks(m._id).length === 0 ? (
                      <p className="text-sm text-gray-500">No tasks assigned.</p>
                    ) : (
                      <ul className="space-y-2">
                        {getMemberTasks(m._id).map((task) => (
                          <li
                            key={task._id}
                            className="p-2 border rounded bg-white shadow-sm"
                          >
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-sm text-gray-700">
                              {task.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              Priority:{" "}
                              <span className="font-medium capitalize">
                                {task.priority}
                              </span>{" "}
                              | Status:{" "}
                              <span className="font-medium capitalize">
                                {task.status}
                              </span>
                            </p>
                            <p className="text-xs text-gray-400">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign Task Button */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowTaskModal(true)}
      >
        Assign Task
      </button>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <Modal
          title={`Add Member to ${singleTeam.name}`}
          close={() => setShowAddMemberModal(false)}
        >
          <input
            type="email"
            placeholder="Member Email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="w-full border p-2 mb-4"
          />
          <p className="text-sm text-gray-500 mb-4">
            Team: <span className="font-semibold">{singleTeam.name}</span>
          </p>
          <Button label="Add Member" onClick={handleAddMember} loading={loading} />
        </Modal>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          show={showTaskModal}
          close={() => setShowTaskModal(false)}
          teamId={singleTeam?._id}
          members={singleTeam.members}
        />
      )}
    </div>
  );
}
