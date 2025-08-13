import express from "express";
import request from "supertest";
import bodyParser from "body-parser";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the auth middleware
vi.mock("../server/middleware/auth", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    // Attach a mock user to the request object
    req.user = { id: "test-user-id", email: "test@example.com" };
    next();
  },
  // Mock AuthedRequest if it's used for type checking in the router
  AuthedRequest: {}
}));

// Define mock functions for the storage module
const mockGetUserCaptures = vi.fn();
const mockGetCaptureById = vi.fn();
const mockUpdateCapture = vi.fn();
const mockDeleteCapture = vi.fn();
const mockCreateCapture = vi.fn();
const mockGetProjects = vi.fn();

// Use vi.doMock for the storage module to avoid hoisting issues with the router import
vi.doMock("../server/storage", () => ({
  storage: {
    getUserCaptures: mockGetUserCaptures,
    getCaptureById: mockGetCaptureById,
    updateCapture: mockUpdateCapture,
    deleteCapture: mockDeleteCapture,
    createCapture: mockCreateCapture,
    getProjects: mockGetProjects,
  },
}));

// Dynamically import the router *after* the mocks are set up
const { capturesRouter } = await import("../server/routes/captures");

function makeApp() {
  const app = express();
  app.use(bodyParser.json());
  // The router will now use the mocked auth and storage
  app.use("/api", capturesRouter);
  return app;
}

const app = makeApp();

describe("Captures Router", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  describe("GET /api/captures", () => {
    it("should return a list of captures for the authenticated user", async () => {
      const captures = [{ id: "1", userId: "test-user-id", title: "Test Capture" }];
      mockGetUserCaptures.mockResolvedValue(captures);

      const res = await request(app).get("/api/captures");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(captures);
      expect(mockGetUserCaptures).toHaveBeenCalledWith("test-user-id");
    });
  });

  describe("POST /api/captures", () => {
    it("should create a new capture and return it", async () => {
      const payload = {
        title: "New Test Capture",
        url: "https://example.com/article",
        notes: "These are the notes.",
      };
      const newCapture = { id: "new-capture-id", userId: "test-user-id", ...payload };

      // Mock the project lookup and the capture creation
      mockGetProjects.mockResolvedValue([{ id: "project-1", name: "My First Project", userId: "test-user-id" }]);
      mockCreateCapture.mockResolvedValue(newCapture);

      const res = await request(app).post("/api/captures").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(newCapture);
      expect(mockCreateCapture).toHaveBeenCalledWith(expect.objectContaining({
        userId: "test-user-id",
        projectId: "project-1",
        title: payload.title,
        content: payload.notes,
      }));
    });
  });

  describe("PATCH /api/captures/:id", () => {
    it("should update the dsdTags and dsdSection for a capture", async () => {
      const captureId = "capture-1";
      const existingCapture = { id: captureId, userId: "test-user-id", title: "Original Title" };
      const updatedCapture = { ...existingCapture, dsdTags: { lifeLens: true }, dsdSection: "define" };

      mockGetCaptureById.mockResolvedValue(existingCapture);
      mockUpdateCapture.mockResolvedValue(updatedCapture);

      const payload = {
        dsdTags: ["life-lens"], // Frontend sends an array of strings
        dsdSection: "define",
      };

      const res = await request(app).patch(`/api/captures/${captureId}`).send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedCapture);
      expect(mockGetCaptureById).toHaveBeenCalledWith(captureId);
      expect(mockUpdateCapture).toHaveBeenCalledWith(captureId, {
        dsdTags: { lifeLens: true }, // Expect the transformed object
        dsdSection: "define",
        content: undefined,
        tags: undefined,
        workspaceNotes: undefined,
      });
    });

    it("should return 403 if user tries to update another user's capture", async () => {
      const captureId = "capture-2";
      const existingCapture = { id: captureId, userId: "another-user-id", title: "Secret Capture" };

      mockGetCaptureById.mockResolvedValue(existingCapture);

      const payload = { title: "New Title" };
      const res = await request(app).patch(`/api/captures/${captureId}`).send(payload);

      expect(res.status).toBe(403);
      expect(mockUpdateCapture).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/captures/:id", () => {
    it("should delete a capture for the authenticated user", async () => {
      const captureId = "capture-3";
      const existingCapture = { id: captureId, userId: "test-user-id", title: "To Be Deleted" };

      mockGetCaptureById.mockResolvedValue(existingCapture);
      mockDeleteCapture.mockResolvedValue(undefined);

      const res = await request(app).delete(`/api/captures/${captureId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockDeleteCapture).toHaveBeenCalledWith(captureId);
    });
  });
});
