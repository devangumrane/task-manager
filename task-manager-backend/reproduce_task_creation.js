import fs from 'fs';

const PORT = 8001; // Targeting verifying the main server
const EMAIL = `task_repro_${Date.now()}@example.com`;
const PASSWORD = 'password123';
const LOG_FILE = 'task_repro.log';

function log(msg) {
    console.log(msg);
    try {
        fs.appendFileSync(LOG_FILE, msg + '\n');
    } catch (e) {
        // ignore
    }
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
        return {
            status: res.status,
            ok: res.ok,
            data: JSON.parse(text),
            raw: text
        };
    } catch (e) {
        return {
            status: res.status,
            ok: res.ok,
            data: null,
            raw: text
        };
    }
}

async function test() {
    fs.writeFileSync(LOG_FILE, '');
    const BASE_URL = `http://localhost:${PORT}/api/v1`;
    log(`Testing Task Creation on PORT ${PORT}...`);

    try {
        // 1. Register
        log(`Registering user...`);
        const regRes = await fetchJson(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD,
                name: 'Task Repro User'
            })
        });

        let token = regRes.data?.data?.accessToken;

        if (!token) {
            // Try login
            const loginRes = await fetchJson(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD })
            });
            token = loginRes.data?.data?.accessToken;
        }

        if (!token) {
            log("Failed to authenticate. Aborting.");
            return;
        }
        log("Authenticated.");

        // 2. Create Workspace
        log("Creating Workspace...");
        const wsRes = await fetchJson(`${BASE_URL}/workspaces`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Task Repro Workspace' })
        });

        if (!wsRes.ok) {
            log(`Failed to create workspace: ${wsRes.raw}`);
            return;
        }
        const workspaceId = wsRes.data.data.id;
        log(`Workspace Created: ID ${workspaceId}`);

        // 3. Create Project
        log("Creating Project...");
        // API: POST /workspaces/:workspaceId/projects
        const projRes = await fetchJson(`${BASE_URL}/workspaces/${workspaceId}/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Task Repro Project',
                description: 'Testing task creation'
            })
        });

        if (!projRes.ok) {
            log(`Failed to create project: ${projRes.raw}`);
            return;
        }
        const projectId = projRes.data.data.id;
        log(`Project Created: ID ${projectId}`);

        // 4. Create Task
        log("Creating Task...");
        // API: POST /workspaces/:workspaceId/projects/:projectId/tasks
        const taskPayload = {
            title: "Test Task",
            description: "From reproduction script",
            priority: "MEDIUM",
            skills: []
        };

        const taskRes = await fetchJson(`${BASE_URL}/workspaces/${workspaceId}/projects/${projectId}/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskPayload)
        });

        if (!taskRes.ok) {
            log(`Failed to create task: ${taskRes.status} ${taskRes.raw}`);
        } else {
            log(`Task Created: ID ${taskRes.data.data.id}`);
            log(JSON.stringify(taskRes.data, null, 2));
        }

    } catch (err) {
        log(`Error: ${err.message}`);
    }
}

test();
