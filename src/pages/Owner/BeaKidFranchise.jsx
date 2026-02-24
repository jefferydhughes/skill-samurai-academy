import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function BeakidFranchiseLanding() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-900">
      {/* HERO */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
          Build the Netflix of After-School Programs in Your City
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
          Own a Beakid franchise and operate a data-driven education hub that
          curates, sells, and delivers the programs parents are already searching for —
          without long-term leases or guesswork.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all">
            Request Franchise Info
          </button>
          <Link to={createPageUrl('HowBeAKidWorks')} className="border-2 border-slate-300 bg-white/60 backdrop-blur hover:bg-white px-8 py-4 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all">
            See How Beakid Works
          </Link>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-t border-b border-white/50 bg-white/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-6 text-center text-sm font-semibold text-slate-700">
          <div>Data-Driven Program Creation</div>
          <div>Marketplace + Franchise Model</div>
          <div>Flexible Spaces, Low Overhead</div>
          <div>Multiple Revenue Streams</div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-6 text-slate-900">
          After-School Education Is Broken
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur border border-white/50 rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-slate-900">Parents Are Overwhelmed</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2"><span className="text-indigo-600">•</span> Fragmented programs</li>
              <li className="flex items-center gap-2"><span className="text-indigo-600">•</span> Inconsistent quality</li>
              <li className="flex items-center gap-2"><span className="text-indigo-600">•</span> Endless searching</li>
              <li className="flex items-center gap-2"><span className="text-indigo-600">•</span> Limited local options</li>
            </ul>
          </div>
          <div className="bg-white/60 backdrop-blur border border-white/50 rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-slate-900">Operators Are Guessing</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2"><span className="text-violet-600">•</span> What programs will sell?</li>
              <li className="flex items-center gap-2"><span className="text-violet-600">•</span> How to fill empty seats?</li>
              <li className="flex items-center gap-2"><span className="text-violet-600">•</span> How to scale without burnout?</li>
              <li className="flex items-center gap-2"><span className="text-violet-600">•</span> How to compete locally?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="bg-gradient-to-br from-indigo-50 to-violet-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-slate-900">
            Beakid Turns Education Into a Platform
          </h2>
          <p className="text-lg text-slate-700 max-w-3xl">
            Beakid is a centralized marketplace and operating system that connects
            parent demand, local providers, licensed curriculum, and flexible spaces —
            all powered by real-time local data.
          </p>
        </div>
      </section>

      {/* WHAT YOU OWN */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-10 text-slate-900">
          What You Own as a Beakid Franchisee
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Local Education Hub",
              desc: "Operate after-school programs, tutoring, camps, and PD day events under one brand.",
              gradient: "from-indigo-500 to-blue-500"
            },
            {
              title: "Flexible Locations",
              desc: "Run programs in temporary rentals, schools, churches, or community spaces.",
              gradient: "from-violet-500 to-purple-500"
            },
            {
              title: "Curated Program Mix",
              desc: "Choose what runs locally — powered by demand data, not guesswork.",
              gradient: "from-pink-500 to-rose-500"
            }
          ].map((item, i) => (
            <div key={i} className="bg-white/60 backdrop-blur border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg`}>
                {i + 1}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="bg-white/40 backdrop-blur-xl py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-slate-900">
            A Marketplace for Programs — Not Just a School
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-white/50 rounded-2xl p-6 bg-white/60 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white mb-3">
                <span className="text-xl">🎓</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Beakid Programs</h3>
              <p className="text-slate-600">
                STEM, coding, tutoring, and camps delivered using Beakid's LMS.
              </p>
            </div>
            <div className="border border-white/50 rounded-2xl p-6 bg-white/60 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white mb-3">
                <span className="text-xl">📚</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Licensed Curriculum</h3>
              <p className="text-slate-600">
                Use third-party or partner curriculum with built-in licensing and tracking.
              </p>
            </div>
            <div className="border border-white/50 rounded-2xl p-6 bg-white/60 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white mb-3">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Local Providers</h3>
              <p className="text-slate-600">
                Offer guitar, Spanish, chess, test prep, and more — Beakid handles sales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">
          Multiple Revenue Streams, One Platform
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'After-school classes & tutoring',
            'Camps and PD days',
            'Memberships & subscriptions',
            'Marketplace commissions',
            'Licensed curriculum delivery',
            'Seat optimization & overflow sales'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/60 backdrop-blur border border-white/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="text-slate-700 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHO ITS FOR */}
      <section className="bg-gradient-to-br from-violet-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-slate-900">
            Who This Franchise Is For
          </h2>
          <div className="bg-white/60 backdrop-blur border border-white/50 rounded-2xl p-8 shadow-xl max-w-3xl">
            <p className="text-slate-700 text-lg mb-4">
              Beakid is ideal for operators who want a modern education business —
              flexible, data-driven, and scalable.
            </p>
            <p className="text-slate-900 font-semibold text-xl">
              You don't need to be a teacher. You need to be a local leader.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.3),transparent_50%)]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Own the Future of After-School Education
          </h2>
          <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
            Territories are limited. Let's explore your city.
          </p>
          <button className="bg-white text-slate-900 px-10 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
            Book a Discovery Call
          </button>
        </div>
      </section>
    </div>
  );
}