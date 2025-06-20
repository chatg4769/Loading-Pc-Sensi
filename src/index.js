import { Hono } from "hono";
const app = new Hono();
// API routes - handled first
app.get("/message", (c) => c.text("Hello Hono!"));
// Static assets - fallback handler
app.get("*", async (c) => {
    return c.env.ASSETS.fetch(c.req.raw);
});
export default app;
