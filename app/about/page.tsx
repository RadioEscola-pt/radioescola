import React from 'react';
import { Users, MessageCircle, Github, Radio, Heart, ExternalLink } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/config';
import { Button } from '@/components/ui/button';

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
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-4 sm:px-8 py-10 sm:rounded-2xl mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <Radio className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Rádio Escola</h1>
            <p className="text-amber-400 font-medium">Aprende. Pratica. Transmite.</p>
          </div>
        </div>
        <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
          Uma plataforma gratuita e open-source que ajuda aspirantes a radioamadores a estudar o material de exame,
          praticar com questões reais e realizar exames simulados.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href={EXTERNAL_LINKS.GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
              Contribuir no GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={EXTERNAL_LINKS.TELEGRAM} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" />
              Juntar ao Telegram
            </a>
          </Button>
        </div>
      </div>

      {/* Mission */}
      <div className="px-4 sm:px-0 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">A Nossa Missão</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Acreditamos que o radioamadorismo é uma forma única de conectar pessoas, aprender sobre tecnologia
            e contribuir para a comunidade. O nosso objetivo é tornar o processo de certificação mais acessível,
            fornecendo ferramentas de estudo modernas e gratuitas para todos os que querem entrar neste hobby fascinante.
          </p>
        </div>
      </div>

      {/* Team */}
      <div className="px-4 sm:px-0 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Equipa</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {team.map((member) => (
            <article
              key={member.callsign}
              className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                </div>
                <span className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  {member.callsign}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="px-4 sm:px-0">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Links Úteis</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={EXTERNAL_LINKS.TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Telegram</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Junta-te à comunidade</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href={EXTERNAL_LINKS.GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Github className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">GitHub</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Código fonte aberto</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
