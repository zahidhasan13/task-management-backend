"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeams,
  createTeam,
  addTeamMember,
} from "@/redux/slices/teamSlice";
import { setCredentials } from "@/redux/slices/authSlice";
import TeamList from "@/components/TeamList";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { Plus, UserPlus, Users } from "lucide-react";

export default function Home() {
  const dispatch = useDispatch();

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const { token, user } = useSelector((state) => state.auth);
  console.log(user,"user")
  const { teams, loading } = useSelector((state) => state.team);

  // ✅ Fetch logged-in user and token
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.user && data.token) {
        dispatch(setCredentials({ user: data.user, token: data.token }));
      }
    };
    fetchUser();
  }, [dispatch]);

  // Load teams
  useEffect(() => {
    if (token) dispatch(fetchTeams());
  }, [token, dispatch]);

  // Create team
  const handleCreateTeam = () => {
    if (!teamName) return alert("Enter team name");
    dispatch(createTeam({ name: teamName }))
      .unwrap()
      .then(() => {
        alert("Team created ✅");
        setShowTeamModal(false);
        setTeamName("");
      })
      .catch((err) => alert(err));
  };

  // Add team member
  const handleAddMember = () => {
    if (!memberEmail || !selectedTeam) return alert("Enter info");
    dispatch(addTeamMember({ memberEmail, teamId: selectedTeam }))
      .unwrap()
      .then(() => {
        alert("Member added ✅");
        setShowAddMemberModal(false);
        setMemberEmail("");
        setSelectedTeam("");
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your teams and collaborate with members
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                onClick={() => setShowTeamModal(true)}
              >
                <Plus className="w-4 h-4" />
                Create Team
              </button>
            </div>
          </div>
        </div>

        {/* Teams List */}
        <TeamList
          teams={teams}
          loading={loading}
          currentUserId={user?._id}
        />

        {/* Create Team Modal */}
        {showTeamModal && (
          <Modal title="Create Team" close={() => setShowTeamModal(false)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <Button
                label="Create"
                onClick={handleCreateTeam}
                loading={loading}
              />
            </div>
          </Modal>
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <Modal
            title="Add Team Member"
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Team
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">Choose a team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                label="Add Member"
                onClick={handleAddMember}
                loading={loading}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
