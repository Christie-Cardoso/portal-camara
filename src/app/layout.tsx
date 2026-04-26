import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal Câmara | Transparência Parlamentar",
  description: "Explore dados sobre deputados federais, despesas da cota parlamentar, partidos e votações de forma clara e moderna.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-navy text-foreground overflow-x-hidden`} suppressHydrationWarning>
        <QueryProvider>
          <Navbar />
          <main className="pt-24">{children}</main>
          <footer className="border-t border-slate-card mt-20 py-12 bg-navy/50">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
              <p>© 2026 Portal Câmara - Dados de <a href="https://dadosabertos.camara.leg.br" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">dadosabertos.camara.leg.br</a></p>
            </div>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
