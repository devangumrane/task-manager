const BASE_URL = 'http://localhost:8001/api/v1';

async function verifyRBAC() {
    try {
        console.log("1. Creating Users...");

        // Helper to register/login
        const createUser = async (name) => {
            const email = `${name}_${Date.now()}@test.com`;
            const password = 'password123';
            try {
                const res = await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                // Auto-login after register, or just register then login
                const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const loginData = await loginRes.json();
                if (!loginRes.ok) throw new Error("Login failed: " + JSON.stringify(loginData));

                return { token: loginData.data.accessToken, id: loginData.data.user.id, email };
            } catch (e) {
                console.error(`Failed to create ${name}:`, e.message);
                throw e;
            }
        };

        const owner = await createUser("Owner");
        const member = await createUser("Member");
        const outsider = await createUser("Outsider");
        console.log("Users created:", { owner: owner.id });

        console.log("2. Owner creating workspace...");
        let workspaceId;
        try {
            const res = await fetch(`${BASE_URL}/workspaces`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${owner.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: "RBAC Test Workspace" })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(data));
            workspaceId = data.data.id;
            console.log("Workspace created:", workspaceId);
        } catch (e) {
            console.error("Failed to create workspace:", e.message);
            throw e;
        }

        console.log("3. Owner adding Member to workspace...");
        try {
            // Need to know how addMember works. Usually takes userId or email.
            // Let's try userId first as it is safer.
            const res = await fetch(`${BASE_URL}/workspaces/${workspaceId}/members`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${owner.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: member.id, role: 'member' })
            });
            const data = await res.json();
            if (!res.ok) {
                // Try email if userId failed? 
                console.log("Adding by userId failed, trying email...");
                const res2 = await fetch(`${BASE_URL}/workspaces/${workspaceId}/members`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${owner.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: member.email, role: 'member' })
                });
                const data2 = await res2.json();
                if (!res2.ok) throw new Error(JSON.stringify(data2));
            }
            console.log("Member added.");
        } catch (e) {
            console.error("Failed to add member:", e.message);
        }

        console.log("4. Verifying Access...");

        const checkAccess = async (user, label, expectedStatus = 200) => {
            const res = await fetch(`${BASE_URL}/workspaces/${workspaceId}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (res.status === expectedStatus) {
                console.log(`✅ ${label}: Success (${res.status})`);
            } else {
                console.error(`❌ ${label}: Failed (Expected ${expectedStatus}, got ${res.status})`);
            }
        };

        await checkAccess(owner, "Owner Access", 200);
        await checkAccess(member, "Member Access", 200);
        await checkAccess(outsider, "Outsider Access", 403); // Outsider should be 403 (or 404 if hidden)

        // Verify Project Creation (Admin Only)
        console.log("5. Testing Admin-Only Action (Create Project)...");
        const resProject = await fetch(`${BASE_URL}/workspaces/${workspaceId}/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${member.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: "Malicious Project" })
        });

        if (resProject.status === 403) {
            console.log("✅ Member Create Project: Denied (403) as expected");
        } else {
            console.error(`❌ Member Create Project: Unexpected status ${resProject.status}`);
        }

    } catch (e) {
        console.error("Verification failed:", e.message);
        if (e.cause) console.error("Cause:", e.cause);
    }
}

verifyRBAC().catch(err => console.error("Unhandled:", err.message));
