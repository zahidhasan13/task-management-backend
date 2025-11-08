"use client";
import Link from "next/link";
import { Users, Crown, ChevronRight } from "lucide-react";

export default function TeamList({ teams, loading }) {
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

  return (
    <div className="grid gap-4">
      {teams.map((team) => (
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
                      <span>{team.captain.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Icon */}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}