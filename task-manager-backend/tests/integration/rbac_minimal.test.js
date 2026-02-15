import request from "supertest";
import { app } from "../../src/app.js";

describe("Minimal Integration Test", () => {
    test("It should import app", () => {
        expect(app).toBeDefined();
    });
});
