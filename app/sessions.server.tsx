import { createCookieSessionStorage } from "@remix-run/node";

export const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "__theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getTheme(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  const theme = session.get("theme");
  return theme || "system";
}

export async function setTheme(request: Request, theme: string) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  session.set("theme", theme);
  return themeStorage.commitSession(session);
}