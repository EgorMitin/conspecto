import { ActionFunction, json } from "@remix-run/node";
import { adminApp } from "~/lib/firebase/admin.server";
import { getStorage } from "firebase-admin/storage";

export const action: ActionFunction = async ({ request }) => {
  if (request.method.toLowerCase() !== "post") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const storage = getStorage(adminApp);
  const bucket = storage.bucket();
  if (!bucket) {
    throw new Error("Firebase bucket not found");
  }

  try {
    const formData = await request.formData();
    const imageUrl = formData.get("url") as string;

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const filePath = imageUrl
      .replace(
        "https://storage.googleapis.com/conspecto-86468.firebasestorage.app/",
        "",
      )
      .replace("%2F", "/");

    await bucket.file(filePath).delete();

    return json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return json({ error: "Failed to delete image" }, { status: 500 });
  }
};
