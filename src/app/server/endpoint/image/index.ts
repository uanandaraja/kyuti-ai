import { Hono } from "hono";
import { auth } from "@/lib/auth";
import OpenAI, { toFile } from "openai";
import { storage } from "@/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/app/server/db";
import { schema } from "@/app/server/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk/v3";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://aihubmix.com/v1"
});

export const imageRoutes = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}>();

imageRoutes.post("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    const user = session?.user;
    
    if(!session || !user) return c.body("Unauthorized", 403);

    try {
        const body = await c.req.parseBody();
        const file = body["file"] as File;
        const prompt = body["prompt"] as string;

        if (!file || !(file instanceof File)) {
            return c.json({ error: "No file provided" }, 400);
        }

        if (!prompt) {
            return c.json({ error: "No prompt provided" }, 400);
        }

        // Generate a unique filename for the original image
        const originalTimestamp = new Date().getTime();
        const originalFileName = `${originalTimestamp}-original.png`;
        
        // Upload original image to S3
        const originalImageBytes = await file.arrayBuffer();
        await storage.send(new PutObjectCommand({
            Bucket: process.env.BUCKET!,
            Key: originalFileName,
            Body: Buffer.from(originalImageBytes),
            ContentType: file.type,
        }));

        const originalUrl = `${process.env.AWS_ENDPOINT_URL_S3}/${process.env.BUCKET}/${originalFileName}`;

        // Create image record in database with "processing" status
        const imageId = nanoid();
        await db.insert(schema.image).values({
            id: imageId,
            userId: user.id,
            originalUrl,
            status: "processing",
            createdAt: new Date(),
        });

        await tasks.trigger("image-edit", { url: originalUrl, prompt, imageId });

        // const imageFile = await toFile(file, null, {
        //     type: file.type,
        // });

        // const rsp = await client.images.edit({
        //     model: "gpt-image-1",
        //     image: imageFile,
        //     prompt: prompt,
        // }) as { data: { b64_json: string }[] };

        // if (!rsp.data[0]?.b64_json) {
        //     // Update status to failed if image generation fails
        //     await db.update(schema.image)
        //         .set({ status: "failed" })
        //         .where(eq(schema.image.id, imageId));
        //     return c.json({ error: "Failed to generate image" }, 500);
        // }

        // // Convert base64 to buffer
        // const imageBytes = Buffer.from(rsp.data[0].b64_json, "base64");
        
        // // Generate a unique filename for the edited image
        // const editedTimestamp = new Date().getTime();
        // const editedFileName = `${editedTimestamp}-edited.png`;

        // // Upload edited image to S3
        // await storage.send(new PutObjectCommand({
        //     Bucket: process.env.BUCKET!,
        //     Key: editedFileName,
        //     Body: imageBytes,
        //     ContentType: "image/png",
        // }));

        // const editedUrl = `${process.env.AWS_ENDPOINT_URL_S3}/${process.env.BUCKET}/${editedFileName}`;

        // // Update image record with edited URL and completed status
        // await db.update(schema.image)
        //     .set({ 
        //         editedUrl,
        //         status: "completed"
        //     })
        //     .where(eq(schema.image.id, imageId));

        return c.json({ status: "success", message: "Image edit task triggered", id: imageId });
    } catch (error) {
        console.error("Error processing image:", error);
        return c.json({ error: "Failed to process image" }, 500);
    }
});

imageRoutes.get("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    const user = session?.user;
    
    if(!session || !user) return c.body("Unauthorized", 403);

    const images = await db.select().from(schema.image).where(eq(schema.image.userId, user.id));

    return c.json(images);
});

imageRoutes.get("/:id", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    const user = session?.user;
    
    if(!session || !user) return c.body("Unauthorized", 403);

    const image = await db.select().from(schema.image).where(eq(schema.image.id, c.req.param("id")));

    if(!image) return c.body("Image not found", 404);

    return c.json(image);
});

imageRoutes.post("/webhook", async (c) => {
    const body = await c.req.json();
    const { imageId, editedUrl } = body;

    if (!imageId || !editedUrl) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    try {
        // Update the image record with the edited URL and set status to completed
        await db.update(schema.image)
            .set({ 
                editedUrl,
                status: "completed"
            })
            .where(eq(schema.image.id, imageId));

        return c.json({ status: "success", message: "Image updated successfully" });
    } catch (error) {
        console.error("Error updating image:", error);
        return c.json({ error: "Failed to update image" }, 500);
    }
});
