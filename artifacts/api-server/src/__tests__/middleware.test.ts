import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requireAuth, requireAdmin } from "../routes/classifieds/middleware.js";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

function mockReq(headers: Record<string, string> = {}): Partial<Request> {
  return { headers } as Partial<Request>;
}

describe("requireAuth middleware", () => {
  it("returns 401 when Authorization header is missing", () => {
    const req = mockReq() as any;
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header does not start with Bearer", () => {
    const req = mockReq({ authorization: "Basic abc123" }) as any;
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid JWT token", () => {
    const req = mockReq({ authorization: "Bearer invalid.token.here" }) as any;
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and sets req.user for a valid JWT", () => {
    const token = jwt.sign({ id: 42, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
    const req = mockReq({ authorization: `Bearer ${token}` }) as any;
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({ id: 42, role: "user" });
  });

  it("returns 401 for an expired JWT token", () => {
    const token = jwt.sign({ id: 1, role: "user" }, JWT_SECRET, { expiresIn: "-1s" });
    const req = mockReq({ authorization: `Bearer ${token}` }) as any;
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("requireAdmin middleware", () => {
  it("returns 403 when user role is not admin", () => {
    const token = jwt.sign({ id: 5, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
    const req = mockReq({ authorization: `Bearer ${token}` }) as any;
    const res = mockRes();
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when user role is admin", () => {
    const token = jwt.sign({ id: 1, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    const req = mockReq({ authorization: `Bearer ${token}` }) as any;
    const res = mockRes();
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
