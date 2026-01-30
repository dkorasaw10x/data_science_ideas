import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial DS Voting Lab",
  description: "Quarterly idea reactor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="lab-bg min-h-screen text-slate-100">
        <div className="relative scanlines">
          <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
        </div>
      </body>
    </html>
  );
}
