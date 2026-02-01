import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";

export const metadata: Metadata = {
  title: "TextFlow - Collaborative Rich-Text Editor",
  description:
    "A real-time collaborative block-based editor. Create, share, and collaborate on documents seamlessly.",
  keywords: [
    "collaborative editor",
    "rich text",
    "notion alternative",
    "real-time collaboration",
    "document editor",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
