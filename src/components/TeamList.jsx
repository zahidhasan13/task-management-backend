"use client";
import Link from "next/link";
import { Users, Crown, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteTeam } from "@/redux/slices/teamSlice";
import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { updateTeam } from "@/redux/slices/teamSlice";

export default function TeamList({ teams, loading, currentUserId }) {
  const dispatch = useDispatch();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [editingTeam, setEditingTeam] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading teams...</p>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium text-lg">No teams found</p>
        <p className="text-gray-500 text-sm mt-2">Create your first team to get started</p>
      </div>
    );
  }

  const openEditModal = (team, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTeam(team);
    setTeamName(team.name);
    setShowTeamModal(true);
  };

  const handleUpdateTeam = () => {
    if (!teamName.trim() || !editingTeam) return;
    dispatch(updateTeam({ teamId: editingTeam._id, name: teamName }));
    setShowTeamModal(false);
    setEditingTeam(null);
    setTeamName("");
  };

  const handleDelete = (team, e) => {
    e.preventDefault();
    e.stopPropagation();
    const isCaptain =
      currentUserId &&
      (team.captain?._id === currentUserId || team.captain === currentUserId);
    if (!isCaptain) return;
    if (confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      dispatch(deleteTeam(team._id));
    }
  };

  return (
    <div>
      {showTeamModal && (
        <Modal
          title={editingTeam ? "Update Team" : "Create Team"}
          close={() => setShowTeamModal(false)}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Team Name</label>
              <input
                type="text"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <Button
              label={editingTeam ? "Update" : "Create"}
              onClick={handleUpdateTeam}
              loading={loading}
            />
          </div>
        </Modal>
      )}

      <div className="grid gap-4">
        {teams.map((team) => {
          const isCaptain =
            currentUserId &&
            (team.captain?._id === currentUserId || team.captain === currentUserId);

          return (
            <Link href={`/team/${team._id}`} key={team._id}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer border border-gray-200 hover:border-blue-300 hover:scale-[1.02] group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Team Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{team.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Crown className="w-4 h-4 text-amber-500" />
                          <span>{team.captain?.name || "Captain"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Only Captain Sees Edit & Delete */}
                  <div className="flex items-center gap-2">
                    {isCaptain && (
                      <>
                        <button
                          onClick={(e) => openEditModal(team, e)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit team"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(team, e)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
