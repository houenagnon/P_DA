"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "Qui sommes-nous ?" },
  { href: "/events", label: "Événements" },
  { href: "/members", label: "Membres" },
  { href: "/blog", label: "Actualités" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-[72px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo/dah-logo.jpg" alt="Data Afrique Hub" className="w-10 h-10 rounded-lg object-cover" />
          <span className="font-bold text-brand-navy text-base hidden sm:block">
            Data Afrique Hub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                  active
                    ? "text-brand-blue"
                    : "text-gray-600 hover:text-brand-navy"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-blue rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/join"
            className="px-4 py-2 text-sm font-medium text-brand-navy hover:text-brand-blue transition-colors"
          >
            Rejoindre la communauté
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Je suis un membre
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-[72px] left-0 right-0 bg-white border-t border-gray-100 shadow-lg md:hidden">
          <div className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-2">
              <Link
                href="/join"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium text-center text-brand-navy border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Rejoindre la communauté
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-center bg-brand-blue text-white rounded-lg hover:bg-blue-700"
              >
                Je suis un membre
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
