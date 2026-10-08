import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سیستم درخواست قیمت | لوله و اتصالات صنعتی",
  description: "درخواست قیمت لوله، اتصالات و شیرآلات صنعتی نفت، گاز و پتروشیمی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-800 font-[Vazirmatn] antialiased">
        {children}
      </body>
    </html>
  );
}
