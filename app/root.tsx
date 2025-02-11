import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { ThemeProvider } from "next-themes"; // I dk the better way to do that and next works fine
import ModalProvider from "~/components/modals/modal-provider";
import { json } from "@remix-run/node";
import clsx from "clsx";
import { Toaster } from "sonner";

import { getTheme } from "~/sessions.server";
import { getUserFromSession } from "~/services/session.server";
import { UserSession } from "./lib/types";
import Error from "./components/Error";

import "./tailwind.css";

export interface RootLoaderData {
  user: UserSession | null;
  theme?: string;
}

export const links: LinksFunction = () => [
  {
    rel: "apple-touch-icon",
    sizes: "32x32",
    href: "/apple-touch-icon.png",
  },
  // Light mode favicons
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon-light.svg",
    media: "(prefers-color-scheme: light)",
  },
  // Dark mode favicons
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon-dark.svg",
    media: "(prefers-color-scheme: dark)",
  },
  // Default favicon (fallback)
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const [theme, user] = await Promise.all([
    getTheme(request),
    getUserFromSession(request),
  ]);

  return json<RootLoaderData>({
    theme,
    user,
  });
}

function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useLoaderData<typeof loader>();
  return (
    <html className={clsx(theme)} lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-[#1F1F1F]">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="conspecto-theme"
        >
          <Toaster position="bottom-center" />
          <ModalProvider />
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Error />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
