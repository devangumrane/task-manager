import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../services/userService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Profile() {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  // ----------------------------------
  // Fetch my profile
  // ----------------------------------
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    onSuccess: (data) => {
      setName(data.name || "");
    },
  });

  // ----------------------------------
  // Update profile (name)
  // ----------------------------------
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to update profile"
      );
    },
  });

  // ----------------------------------
  // Upload avatar
  // ----------------------------------
  const avatarMutation = useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: () => {
      toast.success("Avatar updated");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to upload avatar"
      );
    },
  });

  // ----------------------------------
  // Handlers
  // ----------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    updateMutation.mutate({ name: name.trim() });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    avatarMutation.mutate(file);
  };

  // ----------------------------------
  // States
  // ----------------------------------
  if (isLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load profile:{" "}
        {error?.response?.data?.error?.message || "Unknown error"}
      </div>
    );
  }

  const avatarUrl = profile.profileImage
    ? `${API_BASE_URL}${profile.profileImage}`
    : null;

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <div className="max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {/* Avatar */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                N/A
              </div>
            )}
          </div>

          <label className="cursor-pointer text-sm text-blue-600">
            Change avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={avatarMutation.isLoading}
            />
          </label>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {updateMutation.isLoading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
