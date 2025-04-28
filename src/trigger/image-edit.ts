import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { logger, task, wait } from "@trigger.dev/sdk/v3";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://aihubmix.com/v1"
});

const storage = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.AWS_ENDPOINT_URL_S3!,
  forcePathStyle: true,
});

export const editImage = task({
  id: "image-edit",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: any, { ctx }) => {
    logger.log("Image edit task started", { payload, ctx });

    // Download the image from the URL
    const response = await fetch(payload.url);
    const blob = await response.blob();
    const imageFile = await toFile(blob, null, {
      type: "image/png",
    });

    logger.log("Sending to OpenAI", { imageFile });
    const rsp = await client.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt: payload.prompt,
    }) as { data: { b64_json: string }[] };

    logger.log("Received from OpenAI", { rsp });

    logger.log("Converting to buffer");
    // Convert base64 to buffer
    const imageBytes = Buffer.from(rsp.data[0].b64_json, "base64");
    
    // Generate a unique filename for the edited image
    const editedTimestamp = new Date().getTime();
    const editedFileName = `${editedTimestamp}-edited.png`;

    logger.log("Uploading to S3");
    // Upload edited image to S3
    await storage.send(new PutObjectCommand({
      Bucket: process.env.BUCKET!,
      Key: editedFileName,
      Body: imageBytes,
      ContentType: "image/png",
    }));

    logger.log("Uploaded to S3");

    const editedUrl = `${process.env.AWS_ENDPOINT_URL_S3}/${process.env.BUCKET}/${editedFileName}`;

    logger.log("Sending webhook");
    // Send webhook with imageId and editedUrl
    await fetch(`${process.env.APP_URL}/api/image/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: payload.imageId,
        editedUrl,
      }),
    });

    logger.log("Webhook sent");

    return {
      message: "Image edit task completed",
      url: editedUrl,
    }
  },
});