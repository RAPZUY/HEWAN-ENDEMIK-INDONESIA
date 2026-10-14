import "./globals.css";

export const metadata = {
  title: "Nusantara Fauna: Peta Sebaran Satwa Endemik Indonesia & Konservasi",
  description: "Observatorium geospasial edukatif yang memetakan keanekaragaman satwa endemik Indonesia, status konservasi IUCN, garis biogeografi Wallace-Weber, dan data empiris GBIF.",
  keywords: ["Fauna Indonesia", "Satwa Endemik", "Peta Interaktif", "Konservasi", "Komodo", "Badak Jawa", "Garis Wallace", "Garis Weber", "GBIF", "IUCN"],
  authors: [{ name: "Nusantara Fauna Initiative" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
