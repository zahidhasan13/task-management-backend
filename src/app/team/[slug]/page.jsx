"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTeamMember, getSingleTeam } from "@/redux/slices/teamSlice";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

export default function TeamPage() {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const { teams } = useSelector((state) => state.team);
  const dispatch = useDispatch();
  const { slug } = useParams();
  console.log(slug,"idd") // dynamic route param
  const router = useRouter();

  const { singleTeam, loading, error } = useSelector((state) => state.team);

  useEffect(() => {
    if (!slug) return;
    dispatch(getSingleTeam(slug));
  }, [slug, dispatch]);

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
            onClick={() => setShowAddMemberModal(true)}
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
