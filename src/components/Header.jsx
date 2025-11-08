"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

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
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="group">
            <h1 className="text-2xl font-bold tracking-tight transition-transform duration-200 group-hover:scale-105">
              My App
            </h1>
          </Link>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Hello, {user.name}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            // Loading spinner while fetching user
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              <span className="text-sm font-medium">Loading...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}