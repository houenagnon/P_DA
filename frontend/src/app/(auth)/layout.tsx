import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - Brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-navy relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #0972E1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FF8A00 0%, transparent 40%)", opacity: 0.15 }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold text-sm">DAH</div>
          <span className="text-white font-bold text-lg">Data Afrique Hub</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-brand-blue/30 rounded-full px-4 py-1.5 text-sm text-blue-300">
            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
            Communauté panafricaine
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            La data au service<br />de <span className="text-brand-orange">l&apos;Afrique</span>
          </h2>
          <p className="text-white/60 leading-relaxed">
            Rejoignez des centaines de data scientists, ingénieurs et innovateurs africains qui construisent ensemble l&apos;avenir numérique du continent.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[["30+", "Membres"], ["10+", "Pays"], ["50+", "Formés"]].map(([val, lbl]) => (
              <div key={lbl} className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xl font-bold text-brand-orange">{val}</p>
                <p className="text-white/50 text-xs mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/70 text-sm italic leading-relaxed">
            &ldquo;DAH m&apos;a donné accès à un réseau de professionnels incroyables et des formations de qualité. C&apos;est la meilleure communauté data d&apos;Afrique.&rdquo;
          </p>
          <div className="flex items-center gap-3 mt-4">
            <img src="https://ui-avatars.com/api/?name=Alice+Mensah&background=0972E1&color=fff&bold=true&format=svg" alt="Alice" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-white text-sm font-medium">Alice Mensah</p>
              <p className="text-white/40 text-xs">Data Scientist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-gray-50">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-sm">DAH</div>
          <span className="font-bold text-brand-navy">Data Afrique Hub</span>
        </Link>

        <div className="w-full max-w-[380px]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
