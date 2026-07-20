import type { Metadata } from "next";
import Link from "next/link";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "À propos — Data Afrique Hub" };

const team = [
  { name: "Kouamé Assouman", role: "Président", avatar: "https://ui-avatars.com/api/?name=Kouame+Assouman&background=0972E1&color=fff&bold=true&format=svg" },
  { name: "Fatou Diallo", role: "Trésorière", avatar: "https://ui-avatars.com/api/?name=Fatou+Diallo&background=FF8A00&color=fff&bold=true&format=svg" },
  { name: "Moussa Konaté", role: "Secrétaire Général", avatar: "https://ui-avatars.com/api/?name=Moussa+Konate&background=04041A&color=fff&bold=true&format=svg" },
  { name: "Claire Gbénou", role: "Responsable Formations", avatar: "https://ui-avatars.com/api/?name=Claire+Gbenou&background=059669&color=fff&bold=true&format=svg" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Qui sommes-<span className="text-brand-orange">nous</span> ?
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Data Afrique Hub est une communauté panafricaine dédiée à la promotion et au développement
              de la data science, de l&apos;IA et des technologies numériques en Afrique.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-brand-orange/20 rounded-3xl blur-2xl" />
            <img
              src="/images/students-celebrating.png"
              alt="Membres de la communauté Data Afrique Hub"
              className="relative rounded-2xl shadow-2xl w-full h-64 sm:h-80 object-cover border border-white/10"
            />
          </div>
        </div>
      </section>

      {/* Mission / Vision / Valeurs */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Notre mission", color: "bg-brand-blue", text: "Démocratiser l'accès à la data science en Afrique en créant un espace d'apprentissage, de partage et d'innovation accessible à tous, quelle que soit leur localisation ou leur niveau." },
              { icon: Eye, title: "Notre vision", color: "bg-brand-orange", text: "Faire de l'Afrique un acteur majeur de la révolution data mondiale d'ici 2030, en formant une génération de data scientists, ingénieurs et décideurs data-driven." },
              { icon: Heart, title: "Nos valeurs", color: "bg-brand-navy", text: "Excellence, Inclusion, Collaboration et Impact. Nous croyons que la data peut résoudre les défis les plus complexes du continent lorsqu'elle est entre de bonnes mains." },
            ].map(({ icon: Icon, title, color, text }) => (
              <div key={title} className="rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-5`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-xl text-brand-navy mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Histoire */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Notre histoire</h2>
          </div>
          <div className="space-y-6">
            {[
              { year: "2021", title: "Fondation de DAH", desc: "Née d'une vision partagée par des passionnés de data à Cotonou, DAH voit le jour avec une dizaine de membres fondateurs déterminés à changer le paysage data africain." },
              { year: "2022", title: "Premières formations", desc: "Lancement des premières formations Python et Data Science, avec plus de 50 apprenants formés lors de la première cohorte." },
              { year: "2023", title: "Expansion régionale", desc: "DAH s'étend à 10 pays africains avec des membres au Sénégal, au Ghana, en Côte d'Ivoire, au Togo, au Cameroun et au-delà." },
              { year: "2024", title: "Hackathons & Partenariats", desc: "Organisation du premier Data for Good Hackathon avec 100+ participants. Partenariats stratégiques avec des organisations locales et internationales." },
              { year: "2025", title: "Data Summit Africa", desc: "Organisation du premier Data Summit Africa, notre plus grand rassemblement annuel avec des speakers du monde entier." },
            ].map(({ year, title, desc }) => (
              <div key={year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {year.slice(2)}
                  </div>
                  <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                </div>
                <div className="pb-8">
                  <p className="text-brand-orange text-sm font-semibold mb-1">{year}</p>
                  <h3 className="font-semibold text-brand-navy mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bureau */}
      <section className="bg-brand-navy py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Le bureau</h2>
            <p className="text-white/60">L&apos;équipe qui guide et anime la communauté</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-brand-orange" />
                <p className="font-semibold text-white text-sm">{member.name}</p>
                <p className="text-white/50 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-blue py-16">
        <div className="max-w-2xl mx-auto text-center px-4 text-white">
          <h2 className="text-2xl font-bold mb-4">Rejoignez la communauté</h2>
          <p className="text-blue-100 mb-6">Faites partie de l&apos;aventure et construisez l&apos;Afrique data avec nous.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-blue font-bold rounded-xl hover:bg-blue-50 transition-colors">
            Devenir membre <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
