"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams, createTeam, addTeamMember } from "@/redux/slices/teamSlice";
import { setCredentials } from "@/redux/slices/authSlice";
import TeamList from "@/components/TeamList"; // ✅ Separate Component
import Modal from "@/components/Modal";
import Button from "@/components/Button";

export default function Home() {
  const dispatch = useDispatch();

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const { token, user } = useSelector((state) => state.auth);
  const { teams, loading } = useSelector((state) => state.team);

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

  // Load teams from backend
  useEffect(() => {
    if (token) dispatch(fetchTeams());
  }, [token, dispatch]);

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Teams</h1>

        <div className="flex gap-2">
          <button
            className="bg-green-500 px-4 py-2 text-white rounded hover:bg-green-600"
            onClick={() => setShowAddMemberModal(true)}
          >
            Add Member
          </button>

          <button
            className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600"
            onClick={() => setShowTeamModal(true)}
          >
            Create Team
          </button>
        </div>
      </div>

      <TeamList teams={teams} loading={loading} />

      {showTeamModal && (
        <Modal title="Create Team" close={() => setShowTeamModal(false)}>
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full border p-2 mb-4"
          />
          <Button label="Create" onClick={handleCreateTeam} loading={loading} />
        </Modal>
      )}

      {showAddMemberModal && (
        <Modal title="Add Team Member" close={() => setShowAddMemberModal(false)}>
          <input
            type="email"
            placeholder="Member Email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="w-full border p-2 mb-4"
          />
          <select
            className="w-full border p-2 mb-4"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
          <Button label="Add Member" onClick={handleAddMember} loading={loading} />
        </Modal>
      )}
    </div>
  );
}
