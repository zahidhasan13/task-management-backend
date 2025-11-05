"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";

export default function Home() {
  const dispatch = useDispatch();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const { token, user } = useSelector((state) => state.auth);

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

  useEffect(() => {
    if (!token) return;

    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const res = await fetch("/api/team", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTeams(data.teams || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [token]);

  // ✅ Create Team
  const handleCreateTeam = async () => {
    if (!teamName) return alert("Please enter a team name");
    setLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: teamName }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Team created ✅");
        setTeamName("");
        setShowTeamModal(false);
        setTeams((prev) => [...prev, data.team]);
      } else alert(data.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add Member to Team
  const handleAddMember = async () => {
    if (!memberEmail || !selectedTeam)
      return alert("Enter email and select a team");

    setLoading(true);
    try {
      const res = await fetch("/api/teamMember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberEmail, teamId: selectedTeam }),
      });
      const data = await res.json();
      console.log(data,"add")
      if (res.ok) {
        alert("Member added ✅");
        setMemberEmail("");
        setSelectedTeam("");
        setShowAddMemberModal(false);
      } else alert(data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
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

      {/* Team List */}
      {loadingTeams ? (
        <p>Loading teams...</p>
      ) : teams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        <ul className="space-y-2">
          {teams.map((team) => (
            <li key={team._id} className="border p-3 rounded flex justify-between">
              <div>
                <p className="font-semibold">{team.name}</p>
                <p className="text-sm text-gray-600">
                  Members: {team.members?.length}
                </p>
              </div>
              <span className="text-gray-500 text-sm">
                Captain: {team.captain.name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Create Team Modal */}
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

      {/* Add Member Modal */}
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

// ✅ Reusable Modal Component
function Modal({ title, children, close }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <button
          onClick={close}
          className="mt-4 w-full border py-2 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ✅ Reusable Button
function Button({ label, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {loading ? "Please wait..." : label}
    </button>
  );
}
