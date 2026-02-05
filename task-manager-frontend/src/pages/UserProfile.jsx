import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Camera, Save, X, Edit2 } from "lucide-react";

import { getUserProfile, getMyProfile, updateMyProfile, uploadMyAvatar } from "../services/userService";
import { useAuthStore } from "../store/authStore";
import SkillMatrix from "../components/analytics/SkillMatrix";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export default function UserProfile() {
  const { id } = useParams();
  const { user: authUser, setUser: setAuthUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Decide if we are viewing *our* profile or someone else's
  const isMe = !id || (authUser && Number(id) === authUser.id);
  const profileId = isMe ? authUser?.id : Number(id);

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Fetch Profile
  const { data: user, isLoading } = useQuery({
    queryKey: isMe ? ["myProfile"] : ["user", profileId],
    queryFn: () => isMe ? getMyProfile() : getUserProfile(profileId),
    enabled: !!profileId,
  });

  // 2. Form Setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username || "",
      title: user?.title || "",
      bio: user?.bio || "",
    }
  });

  // Effect to reset form when data loads
  if (user && !isEditing && (reset.isReset === undefined || reset.isReset === false)) {
    reset({
      username: user.username,
      title: user.title,
      bio: user.bio,
    });
    reset.isReset = true; // hacky flag to prevent loop
  }

  // 3. Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedUser) => {
      toast.success("Profile updated");
      setIsEditing(false);
      queryClient.setQueryData(isMe ? ["myProfile"] : ["user", profileId], updatedUser);
      setAuthUser(updatedUser); // Update global store
    },
    onError: () => toast.error("Failed to update profile")
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: (data) => {
      toast.success("Avatar updated");
      queryClient.invalidateQueries(isMe ? ["myProfile"] : ["user", profileId]);
      // Update global store avatar specifically
      setAuthUser({ ...authUser, profileImage: data.avatarUrl });
    },
    onError: () => toast.error("Failed to upload avatar")
  });

  // Handlers
  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const avatarUrl = (user?.profileImage || authUser?.profileImage)
    ? `${API_BASE_URL}${user?.profileImage || authUser?.profileImage}`
    : null;

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Cover / Header Area (Optional: add cover image later) */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-2xl font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Button (Only if Me) */}
              {isMe && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  title="Change Avatar"
                >
                  <Camera size={16} />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Edit Actions */}
            {isMe && !isEditing && (
              <button
                onClick={() => { setIsEditing(true); reset(user); }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {/* Form / Display */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  {...register("username", { required: "Username is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  {...register("title")}
                  placeholder="e.g. Senior Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-indigo-600 font-medium mb-4">{user.title || "No title set"}</p>

              <div className="prose prose-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                {user.bio ? user.bio : <span className="italic text-gray-400">No bio provided.</span>}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Joined</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Professional Compentencies */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <SkillMatrix />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
