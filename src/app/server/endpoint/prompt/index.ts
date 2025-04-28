import { Hono } from "hono";
import { db } from "@/app/server/db";

export const promptRoutes = new Hono()

promptRoutes.get("/", async (c) => {
    const prompts = await db.query.prompt.findMany();
    return c.json({ prompts });
})
