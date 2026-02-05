import User from './User.js';
import Task from './Task.js';
import RefreshToken from './RefreshToken.js';
import Workspace from './Workspace.js';
import WorkspaceMember from './WorkspaceMember.js';
import Project from './Project.js';
import ActivityLog from './ActivityLog.js';
import FailedTask from './FailedTask.js';
import Comment from './Comment.js';
import Attachment from './Attachment.js';
import TaskReminder from './TaskReminder.js';
import Notification from './Notification.js';
import SubTask from './SubTask.js';
import Skill from './Skill.js';
import TaskSkill from './TaskSkill.js';
import UserSkill from './UserSkill.js';

// --- User Associations ---
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
User.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
User.hasMany(WorkspaceMember, { foreignKey: 'user_id', as: 'memberships' });
User.belongsToMany(Workspace, { through: WorkspaceMember, foreignKey: 'user_id', as: 'workspaces' });
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });

// --- Workspace Associations ---
Workspace.hasMany(WorkspaceMember, { foreignKey: 'workspace_id', as: 'members' });
Workspace.belongsToMany(User, { through: WorkspaceMember, foreignKey: 'workspace_id', as: 'users' });
Workspace.hasMany(Project, { foreignKey: 'workspace_id', as: 'projects' });
Workspace.hasMany(Task, { foreignKey: 'workspace_id', as: 'tasks' });
Workspace.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// --- Project Associations ---
Project.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });

// --- Task Associations ---
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Task.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });

// --- RefreshToken Associations ---
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Workspace Member Associations ---
WorkspaceMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WorkspaceMember.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });

// --- Activity Log Associations ---
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ActivityLog.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });
ActivityLog.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
ActivityLog.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// --- Failed Task Associations ---
FailedTask.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- Comment Associations ---
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
Task.hasMany(Comment, { foreignKey: 'task_id', as: 'comments' });

// --- Attachment Associations ---
Attachment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
Task.hasMany(Attachment, { foreignKey: 'task_id', as: 'attachments' });

// --- Task Reminder Associations ---
TaskReminder.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
Task.hasMany(TaskReminder, { foreignKey: 'task_id', as: 'reminders' });

// --- Notification Associations ---
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- SubTask Associations ---
SubTask.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
Task.hasMany(SubTask, { foreignKey: 'task_id', as: 'subtasks' });

// --- Skill Associations ---
// Task <-> Skill
Task.belongsToMany(Skill, { through: TaskSkill, foreignKey: 'task_id', as: 'skills' });
Skill.belongsToMany(Task, { through: TaskSkill, foreignKey: 'skill_id', as: 'tasks' });

// User <-> Skill (Proficiency)
User.belongsToMany(Skill, { through: UserSkill, foreignKey: 'user_id', as: 'skills' });
Skill.belongsToMany(User, { through: UserSkill, foreignKey: 'skill_id', as: 'users' });
// Also direct association for UserSkill to access meta fields
User.hasMany(UserSkill, { foreignKey: 'user_id', as: 'skillProgress' });
UserSkill.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserSkill.belongsTo(Skill, { foreignKey: 'skill_id', as: 'skill' });

export { User, Task, RefreshToken, Workspace, WorkspaceMember, Project, ActivityLog, FailedTask, Comment, Attachment, TaskReminder, Notification, SubTask, Skill, TaskSkill, UserSkill };
