import { ActionFunction, json } from "@remix-run/node";
import { adminApp } from "~/lib/firebase/admin.server";
import { getStorage } from "firebase-admin/storage";

export const action: ActionFunction = async ({ request }) => {
  if (request.method.toLowerCase() !== "post") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const storage = getStorage(adminApp);
    const bucket = storage.bucket();
    if (!bucket) {
      throw new Error("Firebase bucket not found");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const previousUrl = formData.get("previousUrl") as string;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `imgs/image-${Date.now()}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(fileBuffer, {
      contentType: file.type,
      metadata: {
        contentType: file.type
      }
    });

      await fileRef.makePublic();
      const url = fileRef.publicUrl();


    // Delete previous file if exists
    if (previousUrl) {
      const newUrl = previousUrl.replace("https://storage.googleapis.com/conspecto-86468.firebasestorage.app/", '').replace("%2F", '/')
      try {
        const previousFile = bucket.file(newUrl);
        await previousFile.delete();
      } catch (error) {
        console.error("Error deleting previous file:", error);
      }
    }

    return json({ url });

  } catch (error) {
    console.error("Upload error:", error);
    return json({ error: "Upload failed" }, { status: 500 });
  }
};