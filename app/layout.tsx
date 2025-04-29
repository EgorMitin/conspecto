import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";

export const metadata: Metadata = {
  title: "Conspecto",
  description: "Made by Egor Mitin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
