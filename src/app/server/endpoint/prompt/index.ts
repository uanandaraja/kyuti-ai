import { Hono } from "hono";
import { db } from "@/app/server/db";
import { auth } from "@/lib/auth";

export const promptRoutes = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}>();

promptRoutes.get("/", async (c) => {
    const session = c.get("session")
    
    if(!session) return c.body(null, 403);

    const prompts = await db.query.prompt.findMany();
    return c.json({ prompts });
})
