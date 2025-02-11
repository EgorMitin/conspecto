import { ActionFunctionArgs, json } from "@remix-run/node";
import { setTheme } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme");

  if (typeof theme !== "string") {
    return json({ success: false });
  }

  return json(
    { success: true },
    { headers: { "Set-Cookie": await setTheme(request, theme) } },
  );
}
