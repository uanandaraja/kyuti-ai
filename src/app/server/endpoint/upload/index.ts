import { storage } from "@/lib/storage";
import { Hono } from "hono";

export const upload = new Hono()

upload.post("/", async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"] as File;
  
      if (!file || !(file instanceof File)) {
        return c.json({ success: false, error: "File is required" }, 400);
      }

      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name}`;

      await storage.write(fileName, file)

      const uploadedFile = await storage.file(fileName)

      const presignedUrl = uploadedFile.presign({
        method: "GET",
        expiresIn: 21600, // URL expires in 6 hours
      });
  
      return c.json({ url: presignedUrl });
})
