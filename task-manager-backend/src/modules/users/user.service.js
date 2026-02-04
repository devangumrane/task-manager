import { User, Workspace, WorkspaceMember } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";
import { hashPassword } from "../../core/utils/hash.js";

export const userService = {
  // --------------------------------------------
  // Get Profile
  // --------------------------------------------
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User not found", 404);
    }

    return user;
  },

  // --------------------------------------------
  // Update Profile
  // --------------------------------------------
  async updateProfile(userId, data) {
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
  // Search Users (for adding to workspace)
  // --------------------------------------------
  async searchUsers(query) {
    // Basic search by email or name
    if (!query) return [];

    const users = await User.findAll({
      where: {
        [sequelize.Op.or]: [
          { email: { [sequelize.Op.like]: `%${query}%` } },
          { name: { [sequelize.Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'name', 'email', 'avatar'],
      limit: 10
    });
    return users;
  }
};
