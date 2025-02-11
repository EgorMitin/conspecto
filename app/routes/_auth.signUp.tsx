import {
  Form,
  useActionData,
  useNavigation,
  Link,
  useLoaderData,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { adminAuth, adminDb } from "~/lib/firebase/admin.server";
import { Button } from "~/components/ui/button";
import { createUserSession } from "~/services/session.server";
import { Mail as GoogleIcon } from "lucide-react";
import { googleProvider, auth } from "~/lib/firebase/client";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";

interface ActionData {
  error?: string;
  fieldErrors?: {
    nickname?: string;
    email?: string;
    password?: string;
  };
}

const validateNickname = (nickname: string) => {
  if (!nickname || nickname.length < 5) {
    return "Nickname must be at least 5 characters";
  }
};

const validateEmail = (email: string) => {
  if (!email || !email.includes("@")) {
    return "Valid email is required";
  }
};

const validatePassword = (password: string) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters";
  }
};

interface LoaderData {
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  return json({ error });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nickname = formData.get("nickname") as string;
  const provider = formData.get("provider");

  if (provider === "google") {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-in failed:", error);
      throw error;
    }
  }

  if (provider === "email") {
    const fieldErrors = {
      nickname: validateNickname(nickname),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (Object.values(fieldErrors).some(Boolean)) {
      return json({ fieldErrors });
    }
  }

  try {
    const nicknameDoc = await adminDb
      .collection("usernames")
      .doc(nickname.toLowerCase())
      .get();

    if (nicknameDoc.exists) {
      return json({
        error: "This nickname is already taken",
      });
    }

    const userCredentials = await adminAuth.createUser({
      email,
      password,
      displayName: nickname,
    });
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await Promise.all([
      adminDb.collection("usernames").doc(nickname.toLowerCase()).set({
        uid: userCredentials.uid,
        nickname,
        createdAt: new Date(),
      }),
      adminDb.collection("users").doc(userCredentials.uid).set({
        email,
        nickname,
        createdAt: new Date(),
        notes: [],
      }),
    ]);

    const idToken = await userCredential.user.getIdToken();

    return createUserSession(idToken, "/dashboard");
  } catch (error) {
    console.error("Signup error:", error);
    return json({
      error,
    });
  }
};

export default function SignUpForm() {
  const { error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to create your account
        </p>
      </div>

      <Form method="post" className="space-y-4">
        <div className="space-y-2">
          <input
            type="text"
            name="nickname"
            placeholder="Nickname"
            className="w-full p-2 border rounded bg-accent"
            required
          />
          {actionData?.fieldErrors?.nickname && (
            <p className="text-sm text-destructive">
              {actionData.fieldErrors.nickname}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded bg-accent"
            required
          />
          {actionData?.fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {actionData.fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded bg-accent"
            required
          />
          {actionData?.fieldErrors?.password && (
            <p className="text-sm text-destructive">
              {actionData.fieldErrors.password}
            </p>
          )}
        </div>

        {(actionData?.error || error === "google-auth-failed") && (
          <p className="text-sm text-destructive text-center">
            {error === "google-auth-failed"
              ? "Failed to sign in with Google. Please try again."
              : actionData?.error}
          </p>
        )}

        <Button
          type="submit"
          name="provider"
          value="email"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Form id="provider-form" method="post">
        <Button
          type="submit"
          name="provider"
          value="google"
          variant="outline"
          className="w-full text-foreground"
          form="provider-form"
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
