"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";
import TaskModal from "@/components/TaskModal";
import UpdateTaskModal from "@/components/UpdateTaskModal";
import { deleteTask, fetchTasks, updateTask } from "@/redux/slices/taskSlice";
import {
  addTeamMember,
  deleteTeamMember,
  getSingleTeam,
} from "@/redux/slices/teamSlice";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Crown,
  Edit2,
  ListTodo,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function TeamPage() {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const dispatch = useDispatch();
  const { slug } = useParams();

  const { singleTeam, loading, error } = useSelector((state) => state.team);
  const { tasks } = useSelector((state) => state.task);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (slug) dispatch(getSingleTeam(slug));
  }, [slug, dispatch]);

  useEffect(() => {
    if (singleTeam?._id) dispatch(fetchTasks(singleTeam._id));
  }, [singleTeam, dispatch]);

  const isCaptain = () => user?._id === singleTeam?.captain?._id;
  const isTaskAssignee = (task) => user?._id === task.assignedTo?._id;

  const handleDeleteMember = (memberId) => {
    console.log("Incoming:", singleTeam._id, memberId, user._id);

    dispatch(deleteTeamMember({ memberId, teamId: singleTeam._id }));
  };

  const handleAddMember = () => {
    if (!memberEmail) return alert("Enter member email");
    dispatch(addTeamMember({teamId: singleTeam._id, memberEmail }))
      .unwrap()
      .then(() => {
        alert("✅ Member added");
        setShowAddMemberModal(false);
        setMemberEmail("");
        dispatch(getSingleTeam(slug));
      })
      .catch((err) => alert(err));
  };

  const handleDeleteTask = (taskId) => {
    if (!confirm("Delete this task?")) return;
    dispatch(deleteTask(taskId))
      .unwrap()
      .then(() => {
        alert("✅ Task deleted");
        dispatch(fetchTasks(singleTeam._id));
      })
      .catch((err) => alert(`Error: ${err}`));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = (taskId, updates) => {
    dispatch(updateTask({ taskId, updates }))
      .unwrap()
      .then(() => {
        alert("✅ Task updated");
        setShowEditTaskModal(false);
        setEditingTask(null);
        dispatch(fetchTasks(singleTeam._id));
      })
      .catch((err) => alert(`Error: ${err}`));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTask({ taskId, updates: { status: newStatus } }))
      .unwrap()
      .then(() => {
        alert("✅ Status updated");
        dispatch(fetchTasks(singleTeam._id));
      })
      .catch((err) => alert(`Error: ${err}`));
  };

  const getMemberTasks = (memberId) =>
    tasks.filter((task) => task.assignedTo?._id === memberId);

  const getPriorityColor = (p) => {
    const colors = {
      high: "text-red-600 bg-red-50 border-red-200",
      medium: "text-amber-600 bg-amber-50 border-amber-200",
      low: "text-green-600 bg-green-50 border-green-200",
    };
    return colors[p] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getStatusColor = (s) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
      "in-progress": "text-blue-600 bg-blue-50 border-blue-200",
      completed: "text-green-600 bg-green-50 border-green-200",
      revision: "text-purple-600 bg-purple-50 border-purple-200",
    };
    return colors[s] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-600 font-medium text-lg">Loading Team...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!singleTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg">Team not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {singleTeam.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm">
                  Captain:{" "}
                  <span className="font-semibold">
                    {singleTeam.captain?.name}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Team Members
            </h2>
            <div className="flex gap-5">
              {isCaptain() && (
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              )}
              {isCaptain() && (
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                  onClick={() => setShowTaskModal(true)}
                >
                  <ListTodo className="w-5 h-5" />
                  Assign Task
                </button>
              )}
            </div>
          </div>

          {!singleTeam.members || singleTeam.members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No members yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {singleTeam.members.map((m) => (
                <div
                  key={m._id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all duration-200"
                >
                  {/* Member Header */}
                  <div
                    className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() =>
                      setExpandedMember(expandedMember === m._id ? null : m._id)
                    }
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {(m.name?.charAt(0) || "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {m.name}
                          </p>
                          <p className="text-sm text-gray-600">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                          {getMemberTasks(m._id).length} tasks
                        </span>

                        {/* ✅ Show Remove Member Button Only for Captain */}
                        {isCaptain() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMember(m._id);
                            }}
                            className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors border border-red-200"
                          >
                            Remove
                          </button>
                        )}

                        {expandedMember === m._id ? (
                          <ChevronUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Task List */}
                  {expandedMember === m._id && (
                    <div className="p-4 bg-white border-t">
                      {getMemberTasks(m._id).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No tasks assigned.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {getMemberTasks(m._id).map((task) => (
                            <div
                              key={task._id}
                              className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 flex-1">
                                  {task.title}
                                </h4>

                                {isCaptain() && (
                                  <div className="flex items-center gap-2 ml-3">
                                    <button
                                      onClick={() => handleEditTask(task)}
                                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                      title="Edit task"
                                    >
                                      <Edit2 className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task._id)}
                                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <p className="text-sm text-gray-700 mb-3">
                                {task.description}
                              </p>

                              {/* Task Status Controls */}
                              {(isCaptain() || isTaskAssignee(task)) && (
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                                  <button
                                    onClick={() =>
                                      handleStatusChange(task._id, "pending")
                                    }
                                    disabled={task.status === "pending"}
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-yellow-200"
                                  >
                                    Pending
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        task._id,
                                        "in_progress"
                                      )
                                    }
                                    disabled={task.status === "in_progress"}
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-blue-200"
                                  >
                                    In Progress
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(task._id, "completed")
                                    }
                                    disabled={task.status === "completed"}
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-green-200"
                                  >
                                    Completed
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(task._id, "over_due")
                                    }
                                    disabled={task.status === "over_due"}
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-purple-200"
                                  >
                                    Over Due
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddMemberModal && (
          <Modal
            title={`Add Member to ${singleTeam.name}`}
            close={() => setShowAddMemberModal(false)}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Member Email
                </label>
                <input
                  type="email"
                  placeholder="Enter member email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                Team:{" "}
                <span className="font-semibold text-gray-900">
                  {singleTeam.name}
                </span>
              </p>
              <Button
                label="Add Member"
                onClick={handleAddMember}
                loading={loading}
              />
            </div>
          </Modal>
        )}

        {showTaskModal && (
          <TaskModal
            show={showTaskModal}
            close={() => setShowTaskModal(false)}
            teamId={singleTeam._id}
            members={singleTeam.members}
          />
        )}

        {showEditTaskModal && editingTask && (
          <TaskModal
            show={showEditTaskModal}
            close={() => {
              setShowEditTaskModal(false);
              setEditingTask(null);
            }}
            teamId={singleTeam._id}
            members={singleTeam.members}
            editMode={true}
            existingTask={editingTask}
            onUpdate={handleUpdateTask}
          />
        )}
        {showEditTaskModal && editingTask && (
          <UpdateTaskModal
            show={showEditTaskModal}
            close={() => {
              setShowEditTaskModal(false);
              setEditingTask(null);
            }}
            task={editingTask}
          />
        )}
      </div>
    </div>
  );
}
