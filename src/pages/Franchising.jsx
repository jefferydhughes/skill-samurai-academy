export default function Franchising() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-300 blur-3xl animate-blob"></div>
          <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-300 blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-300 blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/80 backdrop-blur-xl px-4 py-2 text-xs font-medium text-indigo-700 shadow-lg shadow-indigo-500/10">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                Low-cost • City-based territories • Ages 5–12
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Build an Affordable Youth Programs Business
                <span className="block text-slate-700">Without a Lease. Without a War Chest. Without Burnout.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-slate-600">
                Launch high-quality youth programs out of schools, churches, and community spaces—powered by shared systems,
                shared curriculum, and character-focused values (faith-neutral). Simple 12-week terms. Predictable membership.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="#apply" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 transition-all hover:scale-105">
                  Apply for a Territory
                  <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#pricing" className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-300 bg-white/80 backdrop-blur-xl px-8 py-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-white hover:scale-105 transition-all">
                  See Pricing
                </a>
              </div>

              {/* quick proof points */}
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-xl">
                  <div className="text-sm font-semibold text-slate-900">12-week terms</div>
                  <div className="mt-1 text-sm text-slate-600">3 terms per school year</div>
                </div>
                <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-xl">
                  <div className="text-sm font-semibold text-slate-900">$99/month membership</div>
                  <div className="mt-1 text-sm text-slate-600">One program track</div>
                </div>
                <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-xl">
                  <div className="text-sm font-semibold text-slate-900">No lease required</div>
                  <div className="mt-1 text-sm text-slate-600">Rent by the hour</div>
                </div>
              </div>
            </div>

            {/* Hero card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">One Territory. Four Brands.</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Launch one brand for $5K, or secure all four in your city for $20K.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-lg">City-based</div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2v6m0 0l3-3m-3 3L9 5M6 11h12M7 21h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Shared Platform</div>
                      <div className="text-sm text-slate-600">Booking • Billing • CRM • Reporting</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path d="M16 7a4 4 0 1 0-8 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Low Facility Risk</div>
                      <div className="text-sm text-slate-600">Church • School • Community Centre</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21s8-4.5 8-11a8 8 0 1 0-16 0c0 6.5 8 11 8 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Predictable Model</div>
                      <div className="text-sm text-slate-600">1 session/week • 12-week terms</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parent Membership</p>
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">$99/month</span> on a 12-month agreement:
                    <span className="font-semibold text-slate-900"> 10 months</span> of classes (Sept–June),
                    <span className="font-semibold text-slate-900"> 1 week</span> of summer camp included,
                    plus a program t-shirt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: THE MODEL */}
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">A simple, disciplined operating model</h2>
            <p className="mt-3 text-slate-600">
              Kids enroll in one program track for a consistent 12-week term. Franchisees run programs in shared spaces using
              standardized session plans and a shared platform.
            </p>
            <div className="mt-6 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl">
              <p className="text-sm font-semibold text-slate-900">School Year (Sept–June)</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>After-school: STEM, Tutoring, Arts</li>
                <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>Evenings/weekends: gym-based sports seasons</li>
                <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400"></span>3 terms per year (12 weeks each)</li>
              </ul>
            </div>
            <div className="mt-4 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-5 shadow-xl">
              <p className="text-sm font-semibold text-slate-900">Summer (Optional Upside)</p>
              <p className="mt-2 text-sm text-slate-600">
                Run STEM camps, sports camps, arts camps, or mixed "fun + learning" camps using the same spaces and staff pool.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500">
                <p className="text-sm font-semibold text-slate-900">No lease required</p>
                <p className="mt-2 text-sm text-slate-600">
                  Operate from churches, public schools, community centres. Rent space by the hour, scale as demand grows.
                </p>
              </div>
              <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500">
                <p className="text-sm font-semibold text-slate-900">Low staffing cost by design</p>
                <p className="mt-2 text-sm text-slate-600">
                  University students + parent volunteers (with training and clear roles). Systems reduce overhead without
                  compromising quality.
                </p>
              </div>
              <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500">
                <p className="text-sm font-semibold text-slate-900">Faith-neutral, values-forward</p>
                <p className="mt-2 text-sm text-slate-600">
                  Character qualities are built into session plans: respect, perseverance, teamwork, responsibility.
                </p>
              </div>
              <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500">
                <p className="text-sm font-semibold text-slate-900">Built for consistency</p>
                <p className="mt-2 text-sm text-slate-600">
                  Same day/time weekly. Same program for the full term. Parents love the predictability.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-800 to-slate-900 p-7 text-white shadow-xl">
              <p className="text-sm font-semibold">Why families choose this</p>
              <p className="mt-2 text-sm text-slate-200">
                Affordable • predictable • not overly competitive • community-based • kids build confidence and character.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-200">Ages</div>
                  <div className="mt-1 text-lg font-bold">5–12</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-200">Frequency</div>
                  <div className="mt-1 text-lg font-bold">1x / week</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-200">Terms</div>
                  <div className="mt-1 text-lg font-bold">12 weeks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: 4 BRANDS */}
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Four brands you can launch in one city</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Each brand shares platform, support, and playbooks—so you can add programs without adding complexity.
            </p>
          </div>
          <a href="#pricing" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-slate-700">
            Pricing options
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {/* Brand 1 */}
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">SparkLab STEM</h3>
                <p className="mt-1 text-sm text-slate-600">Hands-on STEM for curious kids</p>
              </div>
              <div className="rounded-2xl bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">Classroom</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500"></span>Coding logic, robotics, engineering challenges</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500"></span>Small groups, low screen use</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500"></span>1 session/week, 12-week term</li>
            </ul>
          </div>

          {/* Brand 2 */}
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">BrightPath Learning</h3>
                <p className="mt-1 text-sm text-slate-600">Support for learners who don't fit the system</p>
              </div>
              <div className="rounded-2xl bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Quiet room</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Tutoring, homework clubs, reading support</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Small groups or 1:1</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>1 session/week, 12-week term</li>
            </ul>
          </div>

          {/* Brand 3 */}
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">CreativeKids Studio</h3>
                <p className="mt-1 text-sm text-slate-600">Arts, music, crafts, and storytelling</p>
              </div>
              <div className="rounded-2xl bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-800">Studio space</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-500"></span>Visual arts, drama, music, design</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-500"></span>Project-based</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-500"></span>1 session/week, 12-week term</li>
            </ul>
          </div>

          {/* Brand 4 */}
          <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">ActivePlay Sports</h3>
                <p className="mt-1 text-sm text-slate-600">Introductory sports in a fun, non-competitive format</p>
              </div>
              <div className="rounded-2xl bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">Gym/field</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500"></span>Soccer, basketball, gymnastics, multi-sport</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500"></span>Skills over scores</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500"></span>1 session/week, 12-week term</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}