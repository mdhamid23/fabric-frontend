import ClientLayoutWrapper from "@/components/ClientLayoutWrapper"; // Change this import
import { cn } from "@/lib/utils";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Hedvig_Letters_Serif, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const hedvig = Hedvig_Letters_Serif({
  subsets: ["latin"],
  variable: "--font-hedvig-letters-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIUB FST Platform",
  description: "AIUB Faculty of Science and Technology Next-Gen Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        hedvig.variable,
        "font-sans",
        inter.variable,
      )}
      suppressHydrationWarning={true}
    >
      <body className={GeistSans.className}>
        <ReactQueryProvider>
          <ThemeProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
