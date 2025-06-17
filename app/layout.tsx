import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";
import { getCurrentUser } from "@/lib/auth/auth";
import { UserProvider } from "@/lib/context/UserContext";

import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Conspecto",
  description: "Made by Egor Mitin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userPromise = getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <UserProvider userPromise={userPromise}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
