"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  // ✅ Fetch user info from /api/auth/me on page load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();

        if (data.user) {
          dispatch(setCredentials({ user: data.user }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [dispatch]);

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
  <Link href="/"><h1 className="text-xl font-bold">My App</h1></Link>

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
    // Loading spinner while fetching user
    <div className="flex items-center">
      <svg
        className="animate-spin h-5 w-5 text-white mr-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span>Loading...</span>
    </div>
  )}
</header>

  );
}
