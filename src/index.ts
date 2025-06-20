import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static"; // Add this import

interface CloudflareBindings {
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

// API routes - handled first
app.get("/message", (c) => c.text("Hello Hono!"));

// Static assets - fallback handler
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
