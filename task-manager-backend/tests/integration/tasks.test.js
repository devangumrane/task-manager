import request from "supertest";
import app from "../../src/app.js";

const uniqueId = Date.now();
const testUser = {
    username: `taskuser_${uniqueId}`,
    email: `task_${uniqueId}@example.com`,
    password: "password123"
};

let userId;
let token;
let projectId;
let workspaceId;

describe("Task Endpoints", () => {
    beforeAll(async () => {
        // 1. Register User
        await request(app)
            .post("/api/v1/auth/register")
            .send(testUser);

        // 1b. Login to get token
        const loginRes = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        token = loginRes.body.data.accessToken;
        userId = loginRes.body.data.user.id;

        // 2. Create Workspace
        const wsRes = await request(app)
            .post("/api/v1/workspaces")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: `Test Workspace ${uniqueId}` });
        workspaceId = wsRes.body.data.id;

        // 3. Create Project
        const projRes = await request(app)
            .post(`/api/v1/workspaces/${workspaceId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Test Project", description: "Test Desc" });

        projectId = projRes.body.data.id;
    });

    it("should create a new task", async () => {
        const res = await request(app)
            .post(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Integration Test Task",
                priority: "HIGH",
                assignedTo: userId
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.title).toBe("Integration Test Task");
    });

    it("should list tasks for the user (Global My Tasks)", async () => {
        const res = await request(app)
            .get("/api/v1/tasks/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        // Should find the task we just created
        const found = res.body.data.find(t => t.title === "Integration Test Task");
        expect(found).toBeTruthy();
    });
});
