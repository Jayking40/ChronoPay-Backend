import express from "express";
import cors from "cors";
import { validateRequiredFields } from "./middleware/validation.js";
import { requireAdminToken } from "./middleware/authorization.js";
import {
  SlotNotFoundError,
  SlotValidationError,
  slotService,
} from "./services/slotService.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "chronopay-backend" });
});

app.get("/api/v1/slots", (_req, res) => {
  res.json({ slots: slotService.listSlots() });
});

app.post(
  "/api/v1/slots",
  validateRequiredFields(["professional", "startTime", "endTime"]),
  (req, res) => {
    try {
      const slot = slotService.createSlot(req.body);

      return res.status(201).json({
        success: true,
        slot,
      });
    } catch (error) {
      if (error instanceof SlotValidationError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Slot creation failed",
      });
    }
  },
);

app.patch("/api/v1/slots/:id", requireAdminToken, (req, res) => {
  try {
    const slotId = Number.parseInt(req.params.id, 10);
    const updatedSlot = slotService.updateSlot(slotId, req.body);

    return res.status(200).json({
      success: true,
      slot: updatedSlot,
    });
  } catch (error) {
    if (error instanceof SlotValidationError || error instanceof SlotNotFoundError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Slot update failed",
    });
  }
});

/* istanbul ignore next: runtime bootstrap is intentionally skipped during tests */
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`ChronoPay API listening on http://localhost:${PORT}`);
  });
}

export default app;
