import { createApp } from "./app.js";

const app = createApp({
  apiKey: process.env.CHRONOPAY_API_KEY,
  enableDocs: true,
  enableTestRoutes: false,
});
const PORT = process.env.PORT ?? 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`ChronoPay API listening on http://localhost:${PORT}`);
  });
}

export default app;
