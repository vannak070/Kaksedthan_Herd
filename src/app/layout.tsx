import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import AppWrapper from "@/components/layout/AppWrapper";

export const metadata: Metadata = {
  title: "KAKSEDTHAN | Livestock Management System",
  description: "Integrated livestock lifecycle platform connecting Sire, Stock Insemination, Dam, Breeding Program, Calving, Herdbook, Pedigree, Certificate, and QR Verification.",
  icons: {
    icon: [
      { url: "/apple-touch-icon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" }
    ],
    shortcut: "/apple-touch-icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50/80 text-slate-900 font-sans">
        <ReactQueryProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
