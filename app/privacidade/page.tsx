import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, HardDrive, EyeOff, Smartphone } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Rádio Escola',
  description:
    'A Rádio Escola não recolhe dados pessoais. O site e a aplicação Android guardam tudo no seu dispositivo.',
};

/** Shown in the header. Update it whenever the text below changes. */
const LAST_UPDATED = '11 de setembro de 2026';

/** Onde se pede esclarecimento ou apagamento. */
const CONTACT_EMAIL = 'privacidade@radioescola.pt';

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed [&_a]:font-medium [&_a]:text-amber-700 [&_a:hover]:underline dark:[&_a]:text-amber-400">
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-4 sm:px-8 py-10 sm:rounded-2xl mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/20">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidade</h1>
            <p className="text-amber-400 font-medium">Última atualização: {LAST_UPDATED}</p>
          </div>
        </div>
        <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
          A Rádio Escola não recolhe dados pessoais. Não há contas, não há base de dados de
          utilizadores e não há rastreadores, nem no site, nem na aplicação Android. Esta
          página é curta porque não há mais nada a declarar.
        </p>
      </div>

      <div className="px-4 sm:px-0 space-y-10">
        <Section icon={HardDrive} title="O seu estudo fica no seu dispositivo">
          <p>
            As respostas que dá, o progresso, as questões marcadas e o histórico de exames
            ficam guardados no browser, ou na aplicação, no próprio telemóvel. Nunca saem
            daí para servidor nenhum, e nós não temos maneira de lhes aceder.
          </p>
          <p>
            Ficam também aí as suas preferências: o tema claro ou escuro, a língua (num cookie
            chamado <span className="font-mono text-sm">locale</span>, escrito apenas quando
            muda de língua) e as definições de lembretes de estudo.
          </p>
          <p>
            Apagar os dados do site no browser, ou desinstalar a aplicação, apaga tudo isto de
            vez, não temos cópia. No <Link href="/dashboard">painel de progresso</Link> pode
            exportar tudo para um ficheiro, levá-lo para outro dispositivo ou apagá-lo quando
            quiser.
          </p>
        </Section>

        <Section icon={EyeOff} title="O que não fazemos">
          <p>
            Não usamos Google Analytics nem qualquer outra ferramenta de estatísticas,
            publicidade ou criação de perfis. Não há cookies de rastreio, por isso também não
            há aviso a pedir consentimento. Não vendemos nem partilhamos dados pessoais: não
            os temos.
          </p>
          <p>
            Como qualquer servidor web, o nosso pode registar informação técnica sobre os
            pedidos que recebe, endereço IP incluído, só para manter o serviço a funcionar.
            Esses registos duram pouco e não servem para identificar ninguém.
          </p>
        </Section>

        <Section icon={Smartphone} title="Quando nos envia alguma coisa">
          <p>
            Só uma coisa sai do seu dispositivo, e apenas porque o pede: as fotografias de uma
            prova que ainda não temos, enviadas pela página{' '}
            <Link href="/submit-exam">Enviar prova</Link>. O PDF resultante é encaminhado por
            email para a equipa e não é guardado em base de dados nenhuma. O email é opcional
            e serve só para lhe respondermos.
          </p>
          <p>
            Fora disso, o que é de terceiros: a folha do Google Sheets no{' '}
            <Link href="/estado-da-nacao">Estado da Nação</Link>, o PayPal nos{' '}
            <Link href="/donativos">donativos</Link>, o Telegram, o GitHub e o Google Play —
            tem políticas próprias, que se aplicam assim que lá chega.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Os seus direitos, e como falar connosco">
          <p>
            O RGPD dá-lhe o direito de aceder aos seus dados pessoais, corrigi-los, apagá-los
            e levá-los para onde quiser. Aqui exerce-os sozinho e de imediato, porque os dados
            estão consigo: exporta-os e apaga-os no{' '}
            <Link href="/dashboard">painel de progresso</Link>.
          </p>
          <p>
            Para o que nos tiver enviado - uma prova, um email - basta escrever para{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> e apagamos. Pode também
            reclamar junto da{' '}
            <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">CNPD</a>.
          </p>
          <p>
            Se esta política mudar, a data no topo muda com ela, e a alteração fica visível no{' '}
            <a href={EXTERNAL_LINKS.GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              repositório público
            </a>{' '}
            - como todo o código que a cumpre.
          </p>
        </Section>
      </div>
    </main>
  );
}
