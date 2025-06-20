import { Hono } from "hono";

const app = new Hono();

app.use("*", async (c, next) => {
  console.log(`Incoming request: ${c.req.url}`);
  await next();
});

// API routes - handled first
app.get("/message", (c) => c.text("Hello Hono!"));

// Static assets - fallback handler
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
