import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Masters EXPO26 - Kerala's Premier Renewable Energy Showcase",
  description: "Masters Kerala RE 2.0 EXPO26 - September 25-27, 2026 at Calicut Trade Centre, Kozhikode, Kerala.",
  keywords: ["Masters EXPO26", "Renewable Energy Expo Kerala", "Solar Masters Expo", "Kozhikode Trade Centre", "Kerala RE 2.0"],
  authors: [{ name: "Masters Association" }],
  openGraph: {
    title: "Masters EXPO26 - Kerala's Premier Renewable Energy Showcase",
    description: "Join 75,000+ industry leaders, innovators, and visitors at Masters Kerala RE 2.0 EXPO26.",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/assets/logo/favic.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/assets/logo/favic.png" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
