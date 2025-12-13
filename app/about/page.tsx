import React from 'react';
import { Users, MessageCircle, Github } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/config';

type TeamMember = {
  name: string;
  callsign: string;
  role: string;
};

const team: TeamMember[] = [
  {
    name: 'Julio Andrade',
    callsign: 'CT7AZE',
    role: 'Fundador',
  },
  {
    name: 'Alexandre Badalo',
    callsign: 'CT7AXE',
    role: 'Web Master',
  },
  {
    name: 'Luis Serrano',
    callsign: 'CS7BAX',
    role: 'Gestor de Conteúdos',
  },
  {
    name: 'Joel Calado',
    callsign: 'CS7BLE',
    role: 'Web Developer',
  },
];

export default function AboutPage() {
  return (
    <main className="p-8">
      <section className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📻</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Rádio Escola</h1>
          </div>
          <p className="text-gray-700 max-w-3xl">
            Este site ajuda aspirantes a radioamadores a estudar o material de exame, praticar com questões reais e realizar exames simulados.
            É um projeto aberto criado e mantido por radioamadores portugueses.
          </p>
        </div>

        {/* Team */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-amber-600" />
            <h2 className="text-2xl font-semibold">Equipa</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <article
                key={member.callsign}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <span className="shrink-0 text-xs font-mono px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    {member.callsign}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-slate-200 p-6 bg-white">
          <h2 className="text-xl font-semibold mb-3">Contacto</h2>
          <div className="flex flex-col gap-2 text-gray-700">
            <a
              href={EXTERNAL_LINKS.TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Telegram
            </a>
            <a
              href={EXTERNAL_LINKS.GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-600 transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
