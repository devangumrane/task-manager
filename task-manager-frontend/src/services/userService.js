import api from "./api";

/**
 * -----------------------------
 * USER / PROFILE API
 * -----------------------------
 * This file is the ONLY place
 * frontend talks to user endpoints.
 * 
 * axios baseURL already includes: /api/v1
 */

// ----------------------------------
// Get current user's profile
// GET /users/me
// ----------------------------------
export const getMyProfile = async () => {
  const res = await api.get("/users/me");
  return res.data.data;
};

// ----------------------------------
// Update current user's profile
// PATCH /users/me
// Allowed fields: name
// ----------------------------------
export const updateMyProfile = async (payload) => {
  const res = await api.patch("/users/me", payload);
  return res.data.data;
};

// ----------------------------------
// Upload avatar for current user
// POST /users/me/avatar
// multipart/form-data
// ----------------------------------
export const uploadMyAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};

// ----------------------------------
// Get public profile of a user
// GET /users/:id
// ----------------------------------
export const getUserProfile = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data.data;
};

// ----------------------------------
// Search users
// GET /users/search?q=
// ----------------------------------
export const searchUsers = async (query) => {
  const res = await api.get("/users/search", {
    params: { q: query },
  });
  return res.data.data;
};
