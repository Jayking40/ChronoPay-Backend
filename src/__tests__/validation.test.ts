import request from "supertest";
import app from "../index.js";
import { slotService } from "../services/slotService.js";

describe("Input validation middleware", () => {
  beforeEach(() => {
    slotService.reset();
  });

  it("should allow valid slot creation", async () => {
    const res = await request(app).post("/api/v1/slots").send({
      professional: "alice",
      startTime: 1000,
      endTime: 2000,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.slot.id).toBe(1);
  });

  it("should reject missing professional", async () => {
    const res = await request(app).post("/api/v1/slots").send({
      startTime: 1000,
      endTime: 2000,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject missing startTime", async () => {
    const res = await request(app).post("/api/v1/slots").send({
      professional: "alice",
      endTime: 2000,
    });

    expect(res.status).toBe(400);
  });

  it("should reject empty values", async () => {
    const res = await request(app).post("/api/v1/slots").send({
      professional: "",
      startTime: 1000,
      endTime: 2000,
    });

    expect(res.status).toBe(400);
  });

  it("should reject reversed time ranges", async () => {
    const res = await request(app).post("/api/v1/slots").send({
      professional: "alice",
      startTime: 2000,
      endTime: 1000,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("endTime must be greater than startTime");
  });

  it("should return 500 when slot creation fails unexpectedly", async () => {
    const originalCreateSlot = slotService.createSlot;
    slotService.createSlot = (() => {
      throw new Error("unexpected failure");
    }) as typeof slotService.createSlot;

    const res = await request(app).post("/api/v1/slots").send({
      professional: "alice",
      startTime: 1000,
      endTime: 2000,
    });

    slotService.createSlot = originalCreateSlot;

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Slot creation failed");
  });
});