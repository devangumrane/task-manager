import fs from 'fs';
import sequelize from "./src/config/database.js";
import { User, Workspace, WorkspaceMember } from "./src/models/index.js";

const logFile = 'debug_out.txt';

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

async function check() {
    // Clear previous log
    fs.writeFileSync(logFile, '');

    try {
        await sequelize.authenticate();
        log("Connection has been established successfully.");

        const users = await User.findAll({
            include: [
                {
                    model: Workspace,
                    as: 'workspaces',
                    include: [{ model: WorkspaceMember, as: 'members' }]
                }
            ]
        });

        log(`Users found: ${users.length}`);
        users.forEach(user => {
            log(`User: ${user.email} (ID: ${user.id})`);
            log(`Workspaces: ${user.workspaces.length}`);
            user.workspaces.forEach(ws => {
                log(` - ${ws.name} (ID: ${ws.id})`);
            });
        });

        // Also check raw workspaces table
        const allWorkspaces = await Workspace.findAll();
        log(`Total Workspaces in DB: ${allWorkspaces.length}`);
        allWorkspaces.forEach(ws => {
            log(` - ${ws.name} (ID: ${ws.id}, Owner: ${ws.owner_id})`);
        });

        // Check WorkspaceMembers
        const members = await WorkspaceMember.findAll();
        log(`Total Workspace Memberships: ${members.length}`);
        members.forEach(m => {
            log(` - Workspace ${m.workspace_id} User ${m.user_id} Role ${m.role}`);
        });

    } catch (error) {
        log(`Unable to connect to the database: ${error}`);
    } finally {
        await sequelize.close();
    }
}

check();
