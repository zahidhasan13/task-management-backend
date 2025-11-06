"use client";
import Link from "next/link";

export default function TeamList({ teams, loading }) {
  if (loading) return <p>Loading teams...</p>;

  if (!teams || teams.length === 0) return <p>No teams found.</p>;

  return (
    <ul className="space-y-2">
      {teams.map((team) => (
        <Link href={`/team/${team._id}`} key={team._id}>
          <li className="border p-3 rounded flex justify-between cursor-pointer hover:bg-gray-100">
            <div>
              <p className="font-semibold">{team.name}</p>
              <p className="text-sm text-gray-600">Members: {team.members?.length}</p>
            </div>
            <span className="text-gray-500 text-sm">Captain: {team.captain.name}</span>
          </li>
        </Link>
      ))}
    </ul>
  );
}
