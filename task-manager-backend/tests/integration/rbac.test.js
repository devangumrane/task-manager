import request from "supertest";
import { app } from "../../src/app.js";
import { Workspace, User, WorkspaceMember } from "../../src/models/index.js";
import { signAccessToken } from "../../src/core/utils/jwt.js";

// Mock or Setup
let ownerUser, memberUser, otherUser;
let ownerToken, memberToken, otherToken;
let workspace;

describe("RBAC Integration Tests", () => {
    beforeAll(async () => {
        // 1. Create Users
        ownerUser = await User.create({
            username: "owner",
            email: "owner@test.com",
            password: "password123",
        });
        memberUser = await User.create({
            username: "member",
            email: "member@test.com",
            password: "password123",
        });
        otherUser = await User.create({
            username: "other",
            email: "other@test.com",
            password: "password123",
        });

        // 2. Generate Tokens
        ownerToken = signAccessToken({ userId: ownerUser.id, email: ownerUser.email });
        memberToken = signAccessToken({ userId: memberUser.id, email: memberUser.email });
        otherToken = signAccessToken({ userId: otherUser.id, email: otherUser.email });

        // 3. Create Workspace
        workspace = await Workspace.create({
            name: "RBAC Test Workspace",
            owner_id: ownerUser.id,
        });

        // 4. Add Member
        await WorkspaceMember.create({
            workspace_id: workspace.id,
            user_id: memberUser.id,
            role: "member",
        });
    });

    afterAll(async () => {
        // Cleanup
        if (workspace) {
            await WorkspaceMember.destroy({ where: { workspace_id: workspace.id } });
            await Workspace.destroy({ where: { id: workspace.id } });
        }
        await User.destroy({ where: { email: ["owner@test.com", "member@test.com", "other@test.com"] } });
    });

    test("GET /workspaces/:id - Owner should access (Admin Role)", async () => {
        const res = await request(app)
            .get(`/api/v1/workspaces/${workspace.id}`)
            .set("Authorization", `Bearer ${ownerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.id).toBe(workspace.id);
    });

    test("GET /workspaces/:id - Member should access (Member Role)", async () => {
        const res = await request(app)
            .get(`/api/v1/workspaces/${workspace.id}`)
            .set("Authorization", `Bearer ${memberToken}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /workspaces/:id - Non-member should NOT access (403)", async () => {
        const res = await request(app)
            .get(`/api/v1/workspaces/${workspace.id}`)
            .set("Authorization", `Bearer ${otherToken}`);

        expect(res.statusCode).toBe(403);
    });

    test("GET /workspaces/:id - Invalid ID should fail (400/404)", async () => {
        const res = await request(app)
            .get(`/api/v1/workspaces/999999`)
            .set("Authorization", `Bearer ${ownerToken}`);

        expect([400, 404]).toContain(res.statusCode);
    });

    test("POST /workspaces/:id/projects - Member should NOT create project (Admin only)", async () => {
        const res = await request(app)
            .post(`/api/v1/workspaces/${workspace.id}/projects`)
            .set("Authorization", `Bearer ${memberToken}`)
            .send({ name: "Malicious Project" });

        expect(res.statusCode).toBe(403);
    });

    test("POST /workspaces/:id/projects - Owner should create project", async () => {
        const res = await request(app)
            .post(`/api/v1/workspaces/${workspace.id}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ name: "Valid Project", description: "test" });

        expect(res.statusCode).toBe(201);
    });
});
