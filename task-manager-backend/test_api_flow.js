const PORTS = [8002, 8001, 5000];
const EMAIL = `debug_test_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function testPort(port) {
    const BASE_URL = `http://localhost:${port}/api/v1`;
    console.log(`\nTesting PORT ${port}...`);

    try {
        // 1. Register/Login
        console.log(`Attempting Register to ${BASE_URL}/auth/register`);
        let token;

        // Register
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD,
                name: 'Debug User'
            })
        });

        if (regRes.ok) {
            const data = await regRes.json();
            console.log("Register Success");
            token = data.data?.accessToken;

            if (!token) {
                console.log("Register successful but no token. Attempting Login...");
                const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
                });

                if (loginRes.ok) {
                    const data = await loginRes.json();
                    console.log("Login Success");
                    token = data.data.accessToken;
                } else {
                    console.log(`Login Failed (${loginRes.status}):`, await loginRes.text());
                    return;
                }
            }
        } else {
            const txt = await regRes.text();
            console.log(`Register Failed (${regRes.status})`);

            // Try Login if register failed (maybe user exists from previous run)
            console.log("Attempting Login...");
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD })
            });

            if (loginRes.ok) {
                const data = await loginRes.json();
                console.log("Login Success");
                token = data.data.accessToken;
            } else {
                console.log(`Login Failed (${loginRes.status}):`, await loginRes.text());
                return;
            }
        }

        if (!token) {
            console.log("No token obtained. Aborting.");
            return;
        }

        // 2. List Workspaces (Should be empty initially)
        console.log("Listing Workspaces...");
        const listRes = await fetch(`${BASE_URL}/workspaces`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!listRes.ok) {
            console.log(`List Workspaces Failed (${listRes.status}):`, await listRes.text());
        } else {
            const listData = await listRes.json();
            console.log("Workspaces List:", JSON.stringify(listData, null, 2));
        }

        // 3. Create Workspace
        console.log("Creating Workspace...");
        const createRes = await fetch(`${BASE_URL}/workspaces`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Debug Workspace' })
        });

        if (!createRes.ok) {
            console.log(`Create Workspace Failed (${createRes.status}):`, await createRes.text());
        } else {
            const createData = await createRes.json();
            console.log("Create Workspace Result:", JSON.stringify(createData, null, 2));
        }

        // 4. List Workspaces again
        console.log("Listing Workspaces (After creation)...");
        const listRes2 = await fetch(`${BASE_URL}/workspaces`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!listRes2.ok) {
            console.log(`List Workspaces 2 Failed (${listRes2.status}):`, await listRes2.text());
        } else {
            const listData2 = await listRes2.json();
            console.log("Workspaces List 2:", JSON.stringify(listData2, null, 2));

            // 5. Create Project (Verify project.service.js transaction)
            const workspaceId = listData2.data?.[0]?.id || listData2[0]?.id;
            if (workspaceId) {
                console.log(`Creating Project in Workspace ${workspaceId}...`);
                const projRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/projects`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Debug Project' })
                });

                if (!projRes.ok) {
                    console.log(`Create Project Failed (${projRes.status}):`, await projRes.text());
                } else {
                    const projData = await projRes.json();
                    console.log("Create Project Success:", JSON.stringify(projData, null, 2));
                    const projectId = projData.data?.id || projData.id;

                    // 6. Create Task (Verify task.service.js transaction)
                    if (projectId) {
                        console.log(`Creating Task in Project ${projectId}...`);
                        // Route: /api/v1/workspaces/:workspaceId/projects/:projectId/tasks
                        const taskPath = `${BASE_URL}/workspaces/${workspaceId}/projects/${projectId}/tasks`;
                        console.log(`Attempting POST to ${taskPath}`);

                        const taskRes = await fetch(taskPath, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: 'Debug Task',
                                status: 'pending'
                            })
                        });

                        if (!taskRes.ok) {
                            console.log(`Create Task Failed (${taskRes.status}):`, await taskRes.text());
                        } else {
                            const taskData = await taskRes.json();
                            console.log("Create Task Success:", JSON.stringify(taskData, null, 2));
                        }
                    }
                }
            } else {
                console.log("No workspace found to create project in.");
            }
        }

    } catch (err) {
        console.error(`Error testing port ${port}:`, err.message);
    }
}

import fs from 'fs';

// ... (existing code) ...

const logFile = 'api_test.log';
const originalLog = console.log;
const originalError = console.error;

function log(msg) {
    originalLog(msg);
    if (typeof msg === 'string') {
        fs.appendFileSync(logFile, msg + '\n');
    } else {
        fs.appendFileSync(logFile, JSON.stringify(msg) + '\n');
    }

}

// Override console.log
console.log = log;
console.error = log;

async function run() {
    fs.writeFileSync(logFile, '');
    await testPort(8001);
}

run();
