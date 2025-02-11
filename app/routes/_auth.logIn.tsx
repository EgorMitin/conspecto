import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Mail as GoogleIcon } from "lucide-react";
import { createUserSession } from "~/services/session.server";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "~/lib/firebase/client";

interface ActionData {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

const validateEmail = (email: string) => {
  if (!email || !email.includes("@")) {
    return "Valid email is required";
  }
};

const validatePassword = (password: string) => {
  if (!password) {
    return "Password is required";
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
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
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (Object.values(fieldErrors).some(Boolean)) {
      return json({ fieldErrors });
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await userCredential.user.getIdToken();
      return createUserSession(idToken, "/dashboard");
    } catch (error) {
      return json({
        error:
          error instanceof Error ? error.message : "Invalid email or password",
      });
    }
  }
};

export default function LoginForm() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in
        </p>
      </div>

      <Form method="post" className="space-y-4">
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

        {actionData?.error && (
          <p className="text-sm text-destructive text-center">
            {actionData.error}
          </p>
        )}

        <Button
          type="submit"
          name="provider"
          value="email"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
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
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
