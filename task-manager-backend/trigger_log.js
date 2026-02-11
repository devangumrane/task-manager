import fs from 'fs';

const PORT = 8001; // Targeted port
const EMAIL = `log_trigger_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function trigger() {
    const BASE_URL = `http://localhost:${PORT}/api/v1`;
    console.log(`Triggering log on PORT ${PORT}...`);

    try {
        // Register or Login
        let token;
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'Log Trigger' })
        });

        if (regRes.ok) {
            const data = await regRes.json();
            token = data.data?.accessToken;
        } else {
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD })
            });
            if (loginRes.ok) {
                const data = await loginRes.json();
                token = data.data?.accessToken;
            }
        }

        if (token) {
            console.log("Got token, listing workspaces...");
            await fetch(`${BASE_URL}/workspaces`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("Request sent.");
        } else {
            console.log("Failed to get token.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

trigger();
