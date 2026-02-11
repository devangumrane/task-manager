import fs from 'fs';

const PORT = 8002;
const EMAIL = `debug_verify_${Date.now()}@example.com`;
const PASSWORD = 'password123';
const LOG_FILE = 'verification.log';

function log(msg) {
    console.log(msg);
    try {
        fs.appendFileSync(LOG_FILE, msg + '\n');
    } catch (e) {
        // ignore
    }
}

async function test() {
    fs.writeFileSync(LOG_FILE, '');
    const BASE_URL = `http://localhost:${PORT}/api/v1`;
    log(`Testing PORT ${PORT}...`);

    try {
        // Register
        log(`Registering user...`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD,
                name: 'Verify User'
            })
        });

        let token;
        if (regRes.ok) {
            const data = await regRes.json();
            log("Register Success");
            token = data.data?.accessToken;
        } else {
            log(`Register Failed: ${regRes.status} ${await regRes.text()}`);
        }

        if (!token) {
            log("Attempting Login...");
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD })
            });

            if (loginRes.ok) {
                const data = await loginRes.json();
                log("Login Success");
                token = data.data?.accessToken;
            } else {
                log(`Login Failed: ${loginRes.status} ${await loginRes.text()}`);
                return;
            }
        }

        if (!token) {
            log("Still no token. Aborting.");
            return;
        }

        // List Workspaces
        log("Listing Workspaces...");
        const listRes = await fetch(`${BASE_URL}/workspaces`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        log(`Workspaces: ${JSON.stringify(listData, null, 2)}`);

        // Create Workspace
        log("Creating Workspace...");
        const createRes = await fetch(`${BASE_URL}/workspaces`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Verification Workspace' })
        });
        const createData = await createRes.json();
        log(`Create Result: ${JSON.stringify(createData, null, 2)}`);

    } catch (err) {
        log(`Error: ${err.message}`);
    }
}

test();
