import request from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/models/index.js";

const uniqueId = Date.now();
const testUser = {
    username: `testuser_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: "password123"
};

describe("Auth Endpoints", () => {
    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toHaveProperty("email", testUser.email);
    });

    it("should login the user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty("accessToken");
    });

    it("should fail validation with missing fields", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: "fail"
            });

        expect(res.statusCode).toEqual(400); // Assuming 400 for validation error
    });
});
