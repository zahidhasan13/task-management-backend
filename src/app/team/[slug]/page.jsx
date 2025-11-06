"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleTeam } from "@/redux/slices/teamSlice";
import { useParams, useRouter } from "next/navigation";

export default function TeamPage() {
  const dispatch = useDispatch();
  const { slug } = useParams();
  console.log(slug,"idd") // dynamic route param
  const router = useRouter();

  const { singleTeam, loading, error } = useSelector((state) => state.team);

  useEffect(() => {
    if (!slug) return;
    dispatch(getSingleTeam(slug));
  }, [slug, dispatch]);

  // Handle loading and errors
  if (loading) return <p className="p-6">Loading Team...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!singleTeam) return <p className="p-6">Team not found.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Team Header */}
      <div className="border p-4 rounded shadow-sm bg-white">
        <h1 className="text-2xl font-bold">{singleTeam.name}</h1>
        <p className="text-gray-600 text-sm">
          Captain: <span className="font-semibold">{singleTeam.captain?.name}</span>
        </p>
      </div>

      {/* Team Members */}
      <div className="border p-4 rounded shadow-sm bg-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Team Members</h2>
          <button
            className="bg-green-500 px-3 py-1 text-white text-sm rounded hover:bg-green-600"
            onClick={() => alert("Open Add Member Modal")}
          >
            Add Member
          </button>
        </div>

        {!singleTeam.members || singleTeam.members.length === 0 ? (
          <p className="text-gray-500">No members yet.</p>
        ) : (
          <ul className="space-y-2">
            {singleTeam.members.map((m) => (
              <li
                key={m._id}
                className="border p-3 rounded flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-gray-600">{m.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign Task Button */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => alert("Open Assign Task Modal")}
      >
        Assign Task
      </button>
    </div>
  );
}
