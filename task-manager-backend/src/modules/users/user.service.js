import { Op } from 'sequelize';
import { User, Workspace, WorkspaceMember } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";
import { hashPassword } from "../../core/utils/hash.js";

export const userService = {
  // --------------------------------------------
  // Get Me (Profile)
  // --------------------------------------------
  async getMe(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User not found", 404);
    }

    return user;
  },

  // --------------------------------------------
  // Update Me (Profile)
  // --------------------------------------------
  async updateMe(userId, data) {
    // 1. Check if email is being updated and if it's taken
    if (data.email) {
      const existing = await User.findOne({ where: { email: data.email } });
      if (existing && existing.id !== userId) {
        throw new ApiError("EMAIL_TAKEN", "Email is already in use", 409);
      }
    }

    let updateData = { ...data };

    // Hash password if updating
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    await User.update(updateData, { where: { id: userId } });

    const updated = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    return updated;
  },

  // --------------------------------------------
  // Search Users
  // --------------------------------------------
  async search(query) {
    // Basic search by email or name
    if (!query) return [];

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${query}%` } },
          { username: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'username', 'email', 'profile_image'],
      limit: 10
    });
    return users;
  },

  // --------------------------------------------
  // Get Single User (Public/Shared Profile)
  // --------------------------------------------
  async getUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'profile_image', 'title', 'bio']
    });
    return user;
  },

  // --------------------------------------------
  // Update Avatar
  // --------------------------------------------
  async updateAvatar(userId, file) {
    // Assuming file is Multer object: { path, filename, ... }
    // In a real app, upload to S3/Cloudinary here.
    // For now, assume local path relative to public/uploads or similar.
    // If we are using local storage strategy:

    const avatarPath = `/uploads/${file.filename}`; // Adjust based on storage config

    await User.update({ profile_image: avatarPath }, { where: { id: userId } });

    return { profileImage: avatarPath };
  }
};
