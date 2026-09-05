import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MuhaAlifa Repairs — Repair Tracking Platform",
  description: "Every repair, tracked from drop-off to pickup. Log a repair in under a minute. Customers check status with ticket ID or QR.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "MuhaAlifa Repairs",
    description: "Repair tracking platform for phone repair shops.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="app" className="min-h-screen flex flex-col">{children}</div>
        <div id="toast" className="pointer-events-none fixed top-5 left-1/2 -translate-x-1/2 z-[700] opacity-0 transition duration-200 bg-[#0B1220] text-white px-5 py-3 rounded-[9px] text-[13px] font-semibold shadow-xl" />
      </body>
    </html>
  );
}
