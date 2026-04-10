import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import QueryProvider from "@/providers/query-provider";
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
          <nav className="fixed top-0 w-full z-50 bg-navy/80 backdrop-blur-md border-b border-slate-card">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-gold to-gold-hover rounded-xl flex items-center justify-center font-bold text-navy text-xl">
                  C
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Portal Câmara
                </span>
              </Link>
              <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
                <Link href="/" className="hover:text-gold transition-colors">Início</Link>
                <Link href="/deputados" className="hover:text-gold transition-colors">Deputados</Link>
                <Link href="/comparativo" className="hover:text-gold transition-colors">Comparativo</Link>
                <Link href="/sobre" className="hover:text-gold transition-colors">Sobre</Link>
              </div>
            </div>
          </nav>
          <main className="pt-20">{children}</main>
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
