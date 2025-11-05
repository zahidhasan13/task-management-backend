"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);
  console.log(user)

  const handleLogout = async () => {
  // Clear Redux store
  dispatch(setCredentials({ user: null, token: null }));

  // Call backend logout to clear cookie
  await fetch("/api/auth/logout", { method: "GET", credentials: "include" });

  // Redirect to login page
  router.push("/login");
};


  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">My App</h1>

      {user ? (
        <div className="flex items-center space-x-4">
          <span>Hello, {user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <span>Not logged in</span>
      )}
    </header>
  );
}
