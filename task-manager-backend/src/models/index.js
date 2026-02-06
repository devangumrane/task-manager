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
import Tag from './Tag.js';
import TaskTag from './TaskTag.js';
import TimeEntry from './TimeEntry.js';
import TaskDependency from './TaskDependency.js';
import RecurringTask from './RecurringTask.js';

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

// --- Tag Associations ---
Tag.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });
Workspace.hasMany(Tag, { foreignKey: 'workspace_id', as: 'tags' });

Task.belongsToMany(Tag, { through: TaskTag, foreignKey: 'task_id', as: 'tags' });
Tag.belongsToMany(Task, { through: TaskTag, foreignKey: 'tag_id', as: 'tasks' });

// --- TimeEntry Associations ---
TimeEntry.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
Task.hasMany(TimeEntry, { foreignKey: 'task_id', as: 'timeEntries' });
TimeEntry.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(TimeEntry, { foreignKey: 'user_id', as: 'timeEntries' });

// --- Task Dependency Associations ---
// Blocked By: Task.belongsToMany(Task, as: 'blockers')
Task.belongsToMany(Task, {
    through: TaskDependency,
    as: 'blockers',
    foreignKey: 'blocked_task_id',
    otherKey: 'blocker_task_id'
});

// Blocking: Task.belongsToMany(Task, as: 'blocking')
Task.belongsToMany(Task, {
    through: TaskDependency,
    as: 'blocking',
    foreignKey: 'blocker_task_id',
    otherKey: 'blocked_task_id'
});

// Explicit associations for TaskDependency model itself (for direct queries)
TaskDependency.belongsTo(Task, { foreignKey: 'blocker_task_id', as: 'blocker' });
TaskDependency.belongsTo(Task, { foreignKey: 'blocked_task_id', as: 'blocked' });

// --- Recurring Task Associations ---
RecurringTask.belongsTo(Task, { foreignKey: 'original_task_id', as: 'templateTask' });
Task.hasOne(RecurringTask, { foreignKey: 'original_task_id', as: 'recurring' });

export {
    User, Task, RefreshToken, Workspace, WorkspaceMember, Project,
    ActivityLog, FailedTask, Comment, Attachment, TaskReminder,
    Notification, SubTask, Skill, TaskSkill, UserSkill,
    Tag, TaskTag, TimeEntry, TaskDependency, RecurringTask
};
