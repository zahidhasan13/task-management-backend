"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";

export default function Home() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const { token, user } = useSelector((state) => state.auth);
  console.log(teams,"teamssss")

  // ✅ Fetch user on page load to populate Redux
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

  // ✅ Fetch teams whenever token or user changes
  useEffect(() => {
    if (!token || !user) return;

    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const res = await fetch("/api/team", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
  }, [token, user]);

  // ✅ Handle creating a new team
  const handleCreateTeam = async () => {
    if (!token) return alert("No token provided. Please login first.");
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

      if (!res.ok) return alert(data.message || "Failed to create team");

      alert("Team created successfully ✅");
      setTeamName("");
      setShowModal(false);

      // Refresh teams
      const updated = await fetch("/api/team", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedData = await updated.json();
      if (updated.ok) setTeams(updatedData.teams || []);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <button
          className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600 transition"
          onClick={() => setShowModal(true)}
        >
          Create Team
        </button>
      </div>

      {/* Team List */}
      {loadingTeams ? (
        <p>Loading teams...</p>
      ) : teams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        <ul className="space-y-2">
          {teams.map((team) => (
            <li
              key={team._id}
              className="border p-3 rounded hover:bg-gray-100 transition flex justify-between"
            >
              <span>{team.name}</span>
              <span className="text-gray-500 text-sm">
                {team.captain._id === user?._id ? "Captain" : "Member"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Create Team Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4">Create Team</h2>
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
