import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TheNiceBroker — AI rental concierge for Bangalore",
  description:
    "An AI voice concierge that listens to what renters actually want and compares listings honestly. No commission, no pressure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
