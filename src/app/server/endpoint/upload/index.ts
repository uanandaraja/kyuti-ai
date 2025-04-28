import { storage } from "@/lib/storage";
import { Hono } from "hono";
import { PutObjectCommand } from "@aws-sdk/client-s3";
export const upload = new Hono()

upload.post("/", async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"] as File;
  
      if (!file || !(file instanceof File)) {
        return c.json({ success: false, error: "File is required" }, 400);
      }

      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name}`;

      await storage.send(new PutObjectCommand({
        Bucket: process.env.BUCKET!,
        Key: fileName,
        Body: Buffer.from(await file.arrayBuffer()),
      }));

      const url = `${process.env.AWS_ENDPOINT_URL_S3}/${process.env.BUCKET}/${fileName}`;
      
      return c.json({ url });
})
