"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home, Users, BarChart3, Info } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu ao mudar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Impede o scroll quando o menu está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Início", icon: <Home size={18} /> },
    { href: "/deputados", label: "Deputados", icon: <Users size={18} /> },
    { href: "/comparativo", label: "Comparativo", icon: <BarChart3 size={18} /> },
    { href: "/sobre", label: "Sobre", icon: <Info size={18} /> },
  ];

  return (
    <nav className={`
      fixed top-0 w-full z-[100] border-b border-white/5 transition-all duration-300
      ${isOpen ? "bg-[#020617]" : "bg-navy/80 backdrop-blur-lg"}
    `}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-24 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <Image
            src="/logo.png"
            alt="Portal Câmara Logo"
            width={120}
            height={32}
            className="h-6 md:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          <span className="hidden sm:block text-base md:text-xl font-black tracking-tighter bg-gradient-to-r from-white via-[#FDBB04] to-[#FDBB04] bg-clip-text text-transparent">
            Portal Câmara
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-all hover:text-gold ${pathname === link.href ? "text-gold" : "text-slate-400"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-gold transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        fixed inset-0 top-24 bg-[#020617] z-[90] transition-all duration-300 md:hidden
        ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"}
      `}>
        <div className="flex flex-col p-6 space-y-4 h-full">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-4 p-4 rounded-2xl transition-all
                ${pathname === link.href
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-slate-400 hover:bg-white/5"}
              `}
            >
              <span className={pathname === link.href ? "text-gold" : "text-slate-500"}>
                {link.icon}
              </span>
              <span className="text-lg font-bold">{link.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </nav>
  );
}
