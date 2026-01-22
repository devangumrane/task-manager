import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getUserProfile } from "../services/userService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function UserProfile() {
  const { id } = useParams();

  // ----------------------------------
  // Fetch public user profile
  // ----------------------------------
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserProfile(Number(id)),
    enabled: !!id,
  });

  // ----------------------------------
  // States
  // ----------------------------------
  if (isLoading) {
    return <div className="p-6">Loading user profile...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load user:{" "}
        {error?.response?.data?.error?.message || "User not found"}
      </div>
    );
  }

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  const avatarUrl = user.profileImage
    ? `${API_BASE_URL}${user.profileImage}`
    : null;

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <div className="max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-6">User Profile</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${user.name || "User"} avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              N/A
            </div>
          )}
        </div>

        <div>
          <div className="text-lg font-medium">
            {user.name || "Unnamed user"}
          </div>
          <div className="text-sm text-gray-500">
            Joined{" "}
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
