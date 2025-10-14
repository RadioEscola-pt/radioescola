import React from 'react';

type TeamMember = {
  name: string;
  callsign?: string;
  role: string;
  image: string; // public path
  bio: string;
  qrzUrl?: string;
};

export default function AboutPage() {
  const team: TeamMember[] = [
    {
      name: 'Joel Calado',
      callsign: 'CS7BLE',
      role: 'Founder',
      image: '/images/team/joelcalado.jpg', // Placeholder path
      bio: 'Founder and sole team member. Ham radio enthusiast since 2023.',
      qrzUrl: 'https://www.qrz.com/db/CS7BLE',
    },
  ];

  return (
    <main className="p-8">
      <section className="max-w-5xl mx-auto">
        <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">About This Project</h1>
          <p className="mt-3 text-gray-700 max-w-3xl">
            This website helps aspiring ham radio operators study exam material, practice with real questions, and take simulated exams.
            It is an open project created and maintained by Joel Calado.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <article key={m.name} className="group overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-40 w-full bg-gray-100 overflow-hidden">
                <img
                  src={m.image}
                  alt={`${m.name} photo`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{m.name}</h3>
                  {m.callsign && (
                    <a
                      href={m.qrzUrl ?? `https://www.qrz.com/db/${encodeURIComponent(m.callsign)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                    >
                      {m.callsign}
                    </a>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">{m.role}</div>
                <p className="text-sm text-gray-700 mt-3">{m.bio}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-xl border p-6 bg-white">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-gray-700 mb-1">Email: contact@example.com</p>
          <p className="text-gray-700">GitHub: github.com/example/hamradiostudy</p>
        </div>
      </section>
    </main>
  );
}
