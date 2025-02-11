import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { adminAuth, adminDb } from "~/lib/firebase/admin.server";
import { UserSession } from "~/lib/types";

if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set');
  }

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [process.env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export async function createUserSession(idToken: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("token", idToken);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserFromSession(request: Request): Promise<UserSession | null> {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    
    if (!token) return null;
    
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
        const userData = userDoc.data();
        
        return {
            uid: decodedToken.uid,
            email: decodedToken.email || "",
            nickname: userData?.nickname || "",
            notes: userData?.notes || [],
        };
    } catch (error) {
        return null;
    }
}

export async function destroySession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}