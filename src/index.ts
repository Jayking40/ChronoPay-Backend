import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { loadEnvConfig, type EnvConfig } from "./config/env.js";
import {
  requireAuthenticatedActor,
  type AuthenticatedRequest,
} from "./middleware/auth.js";
import { validateRequiredFields } from "./middleware/validation.js";
import {
  BookingIntentError,
  BookingIntentService,
  parseCreateBookingIntentBody,
} from "./modules/booking-intents/booking-intent-service.js";
import { InMemoryBookingIntentRepository } from "./modules/booking-intents/booking-intent-repository.js";
import { InMemorySlotRepository } from "./modules/slots/slot-repository.js";

const config = loadEnvConfig();

interface AppListener {
  listen(port: number, callback?: () => void): unknown;
}

export function createApp(options?: {
  slotRepository?: InMemorySlotRepository;
  bookingIntentService?: BookingIntentService;
}) {
  const app = express();
  const slotRepository = options?.slotRepository ?? new InMemorySlotRepository();
  const bookingIntentService =
    options?.bookingIntentService ??
    new BookingIntentService(new InMemoryBookingIntentRepository(), slotRepository);

  app.use(cors());
  app.use(express.json());

  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: { title: "ChronoPay API", version: "1.0.0" },
    },
    apis: ["./src/routes/*.ts"], // adjust if needed
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "chronopay-backend" });
  });

  app.get("/api/v1/slots", (_req, res) => {
    res.json({ slots: slotRepository.list() });
  });

  app.post(
    "/api/v1/slots",
    validateRequiredFields(["professional", "startTime", "endTime"]),
    (req, res) => {
      const { professional, startTime, endTime } = req.body;

      res.status(201).json({
        success: true,
        slot: {
          id: 1,
          professional,
          startTime,
          endTime,
        },
      });
    },
  );

  app.post(
    "/api/v1/booking-intents",
    requireAuthenticatedActor(["customer", "admin"]),
    (req, res) => {
      try {
        const payload = parseCreateBookingIntentBody(req.body);
        const bookingIntent = bookingIntentService.createIntent(
          payload,
          (req as AuthenticatedRequest).auth!,
        );

        res.status(201).json({
          success: true,
          bookingIntent,
        });
      } catch (error) {
        if (error instanceof BookingIntentError) {
          return res.status(error.status).json({
            success: false,
            error: error.message,
          });
        }

        return res.status(500).json({
          success: false,
          error: "Unable to create booking intent.",
        });
      }
    },
  );

  return app;
}

export function startServer(app: AppListener, runtimeConfig: EnvConfig) {
  return app.listen(runtimeConfig.port, () => {
    console.log(`ChronoPay API listening on http://localhost:${runtimeConfig.port}`);
  });
}

const app = createApp();

if (config.nodeEnv !== "test") {
  startServer(app, config);
}

export default app;
