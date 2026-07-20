import Link from "next/link";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#03045E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden">
                <img src="/logo/dah-logo.jpg" alt="Data Afrique Hub" className="w-full h-full object-cover rounded" />
              </div>
              <span className="font-bold text-lg">Data Afrique Hub</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              La communauté panafricaine dédiée à la data science, l&apos;intelligence
              artificielle et l&apos;innovation numérique en Afrique.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { href: "https://facebook.com", label: "f", title: "Facebook" },
                { href: "https://youtube.com", label: "▶", title: "YouTube" },
                { href: "https://linkedin.com", label: "in", title: "LinkedIn" },
              ].map(({ href, label, title }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0972E1] transition-colors text-sm font-bold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-sm text-white/80 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/about", label: "Qui sommes-nous ?" },
                { href: "/events", label: "Événements" },
                { href: "/login", label: "Connexion" },
                { href: "/register", label: "Rejoindre DAH" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm text-white/80 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>contact@dataafrique.hub</li>
              <li>+229 00 00 00 00</li>
              <li>Cotonou, Bénin</li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-white/40 mb-2">Newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 bg-white/10 text-white text-sm px-3 py-2 rounded-l-lg placeholder-white/30 outline-none focus:bg-white/20 transition-colors min-w-0"
                />
                <button className="bg-[#0972E1] px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-blue-600 transition-colors whitespace-nowrap">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/40 text-sm">
          © {year} Data Afrique Hub — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
