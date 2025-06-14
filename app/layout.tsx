import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";
import { getCurrentUser } from "@/lib/auth/auth";
import { UserProvider } from "@/lib/context/UserContext";
import AppStateProvider from "@/lib/providers/app-state-provider";

import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Conspecto",
  description: "Made by Egor Mitin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <UserProvider initialUser={user}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <AppStateProvider>
              {children}
            </AppStateProvider>
            <Toaster richColors  />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
