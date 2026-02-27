import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import './FranchiseOpportunities.css';

// Scroll reveal
function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => observer.observe(el));

    // Stagger grid children
    document.querySelectorAll('.deliverables-grid, .persona-cards, .fp-grid').forEach((grid) => {
      grid.querySelectorAll(':scope > *').forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.08}s`;
      });
    });

    return () => observer.disconnect();
  }, []);
}

// Revenue calculator scenarios
const SCENARIOS = {
  conservative: {
    students: 40, fee: 109, venue: 1200, royaltyPct: 0.08,
    note: 'Part-time hours. Strong income supplement for a working teacher.'
  },
  target: {
    students: 60, fee: 109, venue: 1600, royaltyPct: 0.08,
    note: 'Target territory. Sustainable as a primary income source.'
  },
  scaled: {
    students: 100, fee: 109, venue: 2200, royaltyPct: 0.08,
    note: 'Two venues, multi-session. Full-time income, part-time hours.'
  }
};

function calcNet(scenario) {
  const s = SCENARIOS[scenario];
  const gross = s.students * s.fee;
  const royalty = Math.round(gross * s.royaltyPct);
  const fixed = 350 + 150;
  return { gross, royalty, net: gross - s.venue - royalty - fixed, ...s };
}

// FAQ data
const FAQS = [
  {
    q: 'Do I need to know how to code to run a Skill Samurai?',
    a: 'No. And we mean that without any asterisks. Our model is built on a <strong>facilitator framework</strong>, not a technical instruction framework. You run the room, manage student dynamics, communicate with parents, and create the environment where learning happens. The AI tools and structured curriculum modules handle the technical scaffolding. If you\'ve spent time in a classroom managing project-based learning, you already have the core skill set. Our 40-hour training covers everything else.'
  },
  {
    q: 'What\'s the real total cost to get started — everything included?',
    a: 'The franchise fee is <strong>$8,900.</strong> Beyond that, you\'re looking at approximately:<br><br>• <strong>Venue deposits</strong> (if any): $0–$500<br>• <strong>Liability insurance</strong> (first year): ~$1,200–$1,800<br>• <strong>Launch marketing</strong> (flyers, local ads): ~$300–$600<br>• <strong>Software / registration setup</strong>: Included in fee<br>• <strong>Branded materials kit</strong> (banners, t-shirts): ~$400–$800<br>• <strong>Working capital buffer</strong> (recommended): ~$2,000–$3,000<br><br><strong>Total realistic all-in: $13,000–$17,000.</strong> That\'s it. Compare that to $177,000–$385,000 for a Code Ninjas learning center and you begin to understand why our franchisees recover their investment in months, not years.'
  },
  {
    q: 'What territory protection do I get?',
    a: 'Each franchisee receives an <strong>exclusive geographic territory</strong> based on population parameters — typically covering a radius that serves a natural community without overlap. Unlike big-box coding franchises that require dense suburban populations of 75,000+ to justify a storefront, Skill Samurai territories can be viable from 15,000 residents upward. That means we can protect meaningful territory in small cities and rural areas where no competitor will ever operate. Your info pack includes a territory assessment for your specific location.'
  },
  {
    q: 'How many students do I need to be profitable?',
    a: 'Break-even is approximately <strong>22–25 enrolled students</strong> at the $109/month price point, accounting for typical venue, insurance, and royalty costs. Most franchisees hit that number within their first 6–8 weeks using the free-first-class launch strategy and one Demo Day event. The math is deliberately conservative — we designed this model so that even a cautious launch trajectory reaches break-even before month 3. At 50 students you\'re generating roughly $2,900–$3,100/month net. At 80–100 students, this is a meaningful full-time income from a part-time schedule.'
  },
  {
    q: 'How does the curriculum stay current as AI tools change so fast?',
    a: 'This is the most important question in the whole industry right now, and it\'s where legacy franchises like Code Ninjas are struggling. Their own franchisees cite "slow pace of response to technological change" as a top complaint in 2025 reviews. <strong>We built our curriculum architecture to be modular and tool-agnostic</strong> — the pedagogy (create → build → ship → reflect) doesn\'t change even when the tools do. Quarterly curriculum updates are included in your royalty, and you\'ll receive notifications whenever a major tool change warrants a mid-quarter update. We also run a live monthly "AI Tools Brief" call so franchisees are always teaching what\'s current.'
  },
  {
    q: 'Can I run this while still teaching full-time?',
    a: 'Yes — and many of our most successful early franchisees did exactly this. The core model runs on <strong>Saturday mornings + one weekday afternoon session</strong>, which is fully compatible with a full-time teaching schedule. You can launch conservatively with a single Saturday cohort (2 sessions, 16–24 students max) and grow into weekday afternoon sessions as demand and your schedule allow. Many franchisees use their first year to build to 40–50 students on weekends alone, then exit teaching or reduce to part-time once their Skill Samurai income surpasses what they need.'
  },
  {
    q: 'What happens if a student or parent becomes a problem? Do I have any support?',
    a: 'You have <strong>direct access to the founding team</strong> for any operational issue, including difficult parent situations, enrollment disputes, or student behavioral concerns. Your franchise package includes templated parent communication letters for common situations (refund requests, behavioral concerns, belt disputes), and our private franchisee community is staffed by experienced operators who have seen most scenarios before. You\'re never building this in isolation.'
  }
];

// Application form initial state
const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  location: '', background: '', investment: ''
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function FranchiseOpportunities() {
  const [openFaq, setOpenFaq] = useState(null);
  const [scenario, setScenario] = useState('conservative');
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useScrollReveal();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const rev = calcNet(scenario);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Navigate to Contact page after short delay, passing franchise context
    setTimeout(() => navigate(createPageUrl('Contact')), 2000);
  };

  return (
    <div className="franchise-page">

      {/* ─── NAV ─── */}
      <nav>
        <div className="f-nav-left">
          <Link to={createPageUrl('Home')} style={{ textDecoration: 'none' }}>
            <div className="f-nav-mark">SKILL <span>SAMURAI</span></div>
          </Link>
          <div className="f-nav-divider" />
          <div className="f-nav-sub">Franchise Opportunity</div>
        </div>
        <div className="f-nav-right">
          <button className="f-nav-link" onClick={() => scrollTo('model')}>The Model</button>
          <button className="f-nav-link" onClick={() => scrollTo('economics')}>Economics</button>
          <button className="f-nav-link" onClick={() => scrollTo('compare')}>vs. Competitors</button>
          <button className="btn-nav-gold" onClick={() => scrollTo('apply')}>Apply Now →</button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="f-hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="f-hero-inner">
          <div className="hero-left-content">
            <div className="hero-eyebrow">
              <div className="eyebrow-chip">Now Accepting Applications · 2025</div>
              <div className="eyebrow-line" />
            </div>

            <h1 className="f-hero-headline">
              <span className="line-dim">You Spent a Career</span><br />
              Building Other People's<br />
              <span className="line-gold">Futures.</span><br />
              Now Build Your Own.
            </h1>

            <p className="f-hero-sub">
              Skill Samurai is the <strong>AI Makers Academy</strong> — a franchise designed from the ground up for former and current educators who want to replace or supplement their teaching income by running something <strong>meaningful, low-overhead, and genuinely cutting-edge.</strong>
              <br /><br />
              No storefront. No build-out. No six-figure investment. Just your expertise, our system, and the fastest-growing segment in children's enrichment.
            </p>

            <div className="f-hero-actions">
              <button className="btn-primary-gold" onClick={() => scrollTo('apply')}>
                ⚔ Request Your Franchise Info Pack
              </button>
              <button className="btn-ghost-f" onClick={() => scrollTo('model')}>
                See how the model works ↓
              </button>
            </div>

            <div className="hero-trust-row">
              <div className="trust-pill-f">
                <span className="trust-pill-f-icon">✓</span>
                <span>$8,900 total franchise fee</span>
              </div>
              <div className="trust-pill-f">
                <span className="trust-pill-f-icon">✓</span>
                <span>No storefront required</span>
              </div>
              <div className="trust-pill-f">
                <span className="trust-pill-f-icon">✓</span>
                <span>Break even in &lt;3 months</span>
              </div>
            </div>
          </div>

          {/* Economics Card */}
          <div className="econ-card">
            <div className="econ-card-header">
              <div className="econ-card-title">📊 The Numbers at a Glance</div>
              <div className="econ-card-subtitle">50 students · $109/month avg fee</div>
            </div>
            <div className="econ-card-body">
              <div className="econ-row">
                <div className="econ-label">Franchise Fee</div>
                <div className="econ-value red">$8,900</div>
              </div>
              <div className="econ-row">
                <div className="econ-label">All-in Startup Cost (incl. fee)</div>
                <div className="econ-value red">~$13,000–$17,000</div>
              </div>
              <div className="econ-row">
                <div className="econ-label">Monthly Gross at 50 Students</div>
                <div className="econ-value">$5,450</div>
              </div>
              <div className="econ-row">
                <div className="econ-label">Est. Monthly Operating Costs</div>
                <div className="econ-value small" style={{ color: 'var(--mist)' }}>~$2,500</div>
              </div>
              <div className="econ-row">
                <div className="econ-label">Est. Monthly Net Profit</div>
                <div className="econ-value gold">~$2,950</div>
              </div>
              <div className="econ-row">
                <div className="econ-label">Estimated Payback Period</div>
                <div className="econ-value small" style={{ color: 'var(--gold)' }}>Under 6 months</div>
              </div>
            </div>
            <div className="econ-card-footer">
              <div className="econ-footer-icon">⚠</div>
              <div className="econ-footer-text">
                Projections are estimates based on comparable operators. Individual results vary.{' '}
                <strong>Full financial details provided in your info pack.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GOLD TICKER ─── */}
      <div className="f-ticker">
        <div className="f-ticker-inner">
          {[
            '$8,900 Franchise Fee', 'No Storefront Needed', 'AI-Native Curriculum',
            'Former Teachers Preferred', 'Break Even in Under 6 Months',
            'Bushido Character Framework', '11 Years of Proven Curriculum',
            'No Coding Experience Required',
            '$8,900 Franchise Fee', 'No Storefront Needed', 'AI-Native Curriculum',
            'Former Teachers Preferred', 'Break Even in Under 6 Months',
            'Bushido Character Framework', '11 Years of Proven Curriculum',
            'No Coding Experience Required',
          ].map((text, i) => (
            <div key={i} className="f-ticker-item">
              <span>{text}</span>
              <span className="f-ticker-dot" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── FOR YOU ─── */}
      <section className="for-you">
        <div className="for-you-inner">
          <div className="for-you-left reveal">
            <div className="section-label-gold">Is This For You?</div>
            <h2>Built for <em>Educators</em><br />Who Are Ready for<br />What's Next.</h2>
            <p>
              You don't need to be a coder. You don't need business experience. You need what you already have: the ability to manage a room of curious kids, communicate with parents, and build community trust.
              <br /><br />
              We've designed every system, script, and curriculum module with one person in mind — the dedicated educator who's spent years giving to others and is ready to build something for themselves.
            </p>
          </div>
          <div className="persona-cards reveal">
            <div className="persona-card ideal">
              <span className="persona-emoji">🏫</span>
              <div className="persona-title">The Active Teacher</div>
              <div className="persona-desc">Still in the classroom but ready to supplement income and build toward an exit. Run Skill Samurai on weekends and afternoons. Keep your benefits while you grow.</div>
            </div>
            <div className="persona-card ideal">
              <span className="persona-emoji">🎓</span>
              <div className="persona-title">The Recent Retiree</div>
              <div className="persona-desc">Left the classroom but not ready to stop making a difference. Skill Samurai gives you structure, income, community, and a reason to get up Monday morning.</div>
            </div>
            <div className="persona-card">
              <span className="persona-emoji">💻</span>
              <div className="persona-title">The Tech-Adjacent Professional</div>
              <div className="persona-desc">You have a background in tech or corporate training and want to move into education entrepreneurship without the credential hurdles.</div>
            </div>
            <div className="persona-card">
              <span className="persona-emoji">👨‍👩‍👧</span>
              <div className="persona-title">The Parent Entrepreneur</div>
              <div className="persona-desc">You saw what was missing in your own child's school and you want to be the person who fills the gap in your community. No prior teaching required.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU GET ─── */}
      <section className="what-you-get" id="economics">
        <div className="wyg-inner">
          <div className="wyg-header reveal">
            <div className="section-label-gold" style={{ justifyContent: 'center' }}>Your Franchise Package</div>
            <h2>Everything You Need to Launch,<br />Included in Your $8,900 Fee</h2>
            <p>We've stripped out every unnecessary expense. What remains is everything that actually drives a successful franchise — and nothing that doesn't.</p>
          </div>

          <div className="deliverables-grid reveal">
            {[
              { icon: '📚', title: 'Complete AI-Native Curriculum', desc: '150+ hours of structured, age-tiered content across 5 belt levels. Updated quarterly as AI tools evolve — automatically included, no extra cost.' },
              { icon: '🎨', title: 'Branded Marketing Kit', desc: 'Flyers, social templates, email sequences, a parent info packet, and a launch playbook that gets you from "signed" to "enrolled first students" in 30 days.' },
              { icon: '🏛️', title: 'Venue Negotiation Playbook', desc: 'Proven scripts and templates for securing church gyms, school rooms, and library spaces at $0–$75/hour. We\'ve done the research. You get the results.' },
              { icon: '🛡️', title: 'Insurance & Legal Framework', desc: 'Youth liability insurance structure, waivers, student intake forms, and background check processes — fully drafted and ready to use.' },
              { icon: '💻', title: 'Software & Registration Platform', desc: 'Online enrollment, payment processing, attendance tracking, and parent communication tools — all set up before you teach your first class.' },
              { icon: '🎓', title: '40-Hour Franchisee Training', desc: 'Live and on-demand training covering curriculum delivery, parent communications, community marketing, and AI tool facilitation. No coding background required.' },
              { icon: '⚔️', title: 'Bushido Character Framework', desc: 'The complete virtue curriculum, belt ceremony scripts, student reflection guides, and parent communication letters that turn a coding class into something families remember forever.' },
              { icon: '📣', title: 'Demo Day Launch System', desc: 'Everything needed to run your quarterly public showcase events: event templates, PR outreach scripts, sponsor pitch decks, and a run-of-show guide.' },
              { icon: '🤝', title: 'Ongoing Franchisor Support', desc: 'Monthly group calls, a private franchisee community, curriculum updates, and direct access to the founding team. You\'re never building this alone.' },
            ].map((item, i) => (
              <div key={i} className="deliverable">
                <span className="deliverable-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Fee Breakdown */}
          <div className="fee-breakdown reveal">
            <div className="fee-header">
              <div className="fee-header-left">
                <h3>Investment Comparison</h3>
                <p>What you're buying — and what you're not paying for</p>
              </div>
              <div className="fee-total">
                <span className="fee-total-amount">$8,900</span>
                <span className="fee-total-label">Total Franchise Fee</span>
              </div>
            </div>

            <div className="fee-compare">
              <div className="fee-compare-col">
                <h4>Skill Samurai</h4>
                {[
                  ['Franchise Fee', '$8,900'],
                  ['Build-out / Renovation', <span className="green">$0</span>],
                  ['Monthly Lease', <span className="green">$0</span>],
                  ['Inventory / Equipment', <span className="green">$0</span>],
                  ['Curriculum Platform', <span className="green">Included</span>],
                  ['Venue (rental)', '$800–$1,200/mo'],
                  ['Royalty Fee', '8% gross'],
                  ['Total Startup', <span className="green">~$13,000–17,000</span>],
                ].map(([label, val], i) => (
                  <div key={i} className="fee-compare-item"><span>{label}</span><span>{val}</span></div>
                ))}
              </div>
              <div className="fee-compare-col">
                <h4>Code Ninjas (Learning Center)</h4>
                {[
                  ['Franchise Fee', <span className="red-text">$40,000</span>],
                  ['Build-out / Renovation', <span className="red-text">$60K–$200K</span>],
                  ['Monthly Lease', <span className="red-text">$3,000–$8,000/mo</span>],
                  ['Inventory / Equipment', <span className="red-text">$15,000+</span>],
                  ['Curriculum Platform', <span className="red-text">Proprietary only</span>],
                  ['Venue', <span className="red-text">Permanent lease req.</span>],
                  ['Royalty Fee', <span className="red-text">8% + 2% ad fund</span>],
                  ['Total Startup', <span className="red-text">$177,000–$385,000</span>],
                ].map(([label, val], i) => (
                  <div key={i} className="fee-compare-item"><span>{label}</span><span>{val}</span></div>
                ))}
              </div>
              <div className="fee-compare-col">
                <h4>Going Independent</h4>
                {[
                  ['Franchise Fee', <span className="green">$0</span>],
                  ['Curriculum Development', <span className="red-text">$15,000–$40,000</span>],
                  ['Brand / Marketing', <span className="red-text">$5,000–$20,000</span>],
                  ['Legal / Waivers', <span className="red-text">$3,000–$8,000</span>],
                  ['Software / Platform', <span className="red-text">$2,000–$6,000</span>],
                  ['Time to First Revenue', <span className="red-text">6–18 months</span>],
                  ['Ongoing Support', <span className="red-text">None</span>],
                  ['Total Startup', <span className="red-text">$25,000–$75,000+</span>],
                ].map(([label, val], i) => (
                  <div key={i} className="fee-compare-item"><span>{label}</span><span>{val}</span></div>
                ))}
              </div>
            </div>

            <div className="fee-footer">
              <div className="fee-guarantee">
                <span className="fee-guarantee-icon">🛡️</span>
                <span>Our goal is for every franchisee to recoup their full $8,900 franchise fee within 90 days of their first class. We'll show you exactly how in your info pack.</span>
              </div>
              <button className="btn-nav-gold" onClick={() => scrollTo('apply')}>Get the Full Breakdown →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE MODEL ─── */}
      <section className="the-model" id="model">
        <div className="model-inner">
          <div className="model-content reveal">
            <div className="section-label-gold">How It Works</div>
            <h2>A Business Model Built for <em>Real Life</em> — Not Strip Malls</h2>
            <p>
              Every other coding franchise is built around a storefront. We built ours around <strong>the educator.</strong> That single decision changes everything: the startup cost, the risk profile, the flexibility, and the community impact.
            </p>
            <p>
              Your "campus" is wherever your community already gathers — the church gym on Saturday mornings, the school cafeteria after hours, the library meeting room. These spaces exist in every city, town, and suburb in America. They're affordable, trusted, and often enthusiastic about hosting a kids' STEM program.
            </p>

            <ol className="model-steps">
              {[
                {
                  title: 'Secure Your Venue(s)',
                  desc: 'Use our venue playbook to lock in 1–2 community spaces. Target: $25–$75/hour. Many church gyms are free or near-free for youth education programs.'
                },
                {
                  title: 'Launch Your First Cohort',
                  desc: 'Use our 30-day launch playbook: school flyers, Facebook community groups, local elementary school newsletters. First class is always free — that\'s how you fill your first cohort.'
                },
                {
                  title: 'Teach 2 Sessions Per Week',
                  desc: 'Saturday mornings + one weekday afternoon. Groups of 8–12 students per session. You run the room; the AI curriculum runs itself. You don\'t need to be a coder — you need to be a great facilitator.'
                },
                {
                  title: 'Host Quarterly Demo Days',
                  desc: 'Your most powerful marketing event costs almost nothing. Students present their projects. Parents share videos. Enrollment grows organically. One Demo Day typically generates 8–15 new enrollments.'
                },
                {
                  title: 'Scale on Your Terms',
                  desc: 'Add a second venue, a second session time, or a teen/adult evening cohort. Most franchisees reach 100+ enrolled students within 12 months — at which point this is a real full-time income.'
                },
              ].map((step, i) => (
                <li key={i} className="model-step">
                  <div className="model-step-num">{i + 1}</div>
                  <div className="model-step-body">
                    <h5>{step.title}</h5>
                    <p>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Revenue Calculator */}
          <div className="revenue-stack reveal">
            <div className="rev-card">
              <div className="rev-card-top">
                <h4>📈 Monthly Revenue Calculator</h4>
                <div className="rev-scenario">
                  {['conservative', 'target', 'scaled'].map((key) => (
                    <button
                      key={key}
                      className={`rev-tab${scenario === key ? ' active' : ''}`}
                      onClick={() => setScenario(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="rev-display">
                  <div className="rev-students">{rev.students} students enrolled</div>
                  <div className="rev-amount">${rev.gross.toLocaleString()}</div>
                  <div className="rev-period">monthly gross revenue</div>
                </div>
              </div>
              <div className="rev-rows">
                <div className="rev-row">
                  <span className="rev-row-label">Avg fee per student</span>
                  <span className="rev-row-val">${rev.fee}/mo</span>
                </div>
                <div className="rev-row">
                  <span className="rev-row-label">Venue rental (2×/wk)</span>
                  <span className="rev-row-val neg">−${rev.venue.toLocaleString()}</span>
                </div>
                <div className="rev-row">
                  <span className="rev-row-label">Insurance &amp; software</span>
                  <span className="rev-row-val neg">−$350</span>
                </div>
                <div className="rev-row">
                  <span className="rev-row-label">Royalty (8%)</span>
                  <span className="rev-row-val neg">−${rev.royalty.toLocaleString()}</span>
                </div>
                <div className="rev-row">
                  <span className="rev-row-label">Marketing / misc</span>
                  <span className="rev-row-val neg">−$150</span>
                </div>
              </div>
              <div className="rev-card-bottom">
                <div className="rev-net">
                  <span className="rev-net-label">Est. Monthly Net</span>
                  <span className="rev-net-val">~${rev.net.toLocaleString()}</span>
                </div>
                <div className="rev-note">{rev.note}</div>
              </div>
            </div>

            {/* Payback timeline */}
            <div className="payback-row">
              <div className="payback-label">Payback timeline at target (50 students)</div>
              <div className="payback-cols">
                <div className="payback-col payback-col-gold">
                  <div className="payback-num payback-num-gold">3 mo</div>
                  <div className="payback-desc">Franchise fee recouped</div>
                </div>
                <div className="payback-col payback-col-red">
                  <div className="payback-num payback-num-red">6 mo</div>
                  <div className="payback-desc">Full startup costs recouped</div>
                </div>
                <div className="payback-col payback-col-green">
                  <div className="payback-num payback-num-green">12 mo</div>
                  <div className="payback-desc">Established, scalable business</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="comparison" id="compare">
        <div className="comp-inner">
          <div className="comp-header reveal">
            <div className="section-label-gold" style={{ justifyContent: 'center' }}>Side-by-Side Comparison</div>
            <h2>Why Smart Franchisees<br />Choose Skill Samurai First</h2>
            <p>We don't ask you to take our word for it. Here's the objective comparison.</p>
          </div>

          <div className="comp-table-wrap reveal">
            <table className="comp-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Feature</th>
                  <th className="highlight" style={{ width: '23%' }}>⚔ Skill Samurai</th>
                  <th style={{ width: '23%' }}>Code Ninjas</th>
                  <th style={{ width: '24%' }}>Go Independent</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Franchise / Startup Fee', '$8,900', '$40,000+', '$0 (but $25K–$75K total)'],
                  ['Storefront / Lease Required', <span className="check-y">✓ No</span>, <span className="check-n">✗ Yes — mandatory</span>, <span className="check-m">◐ Optional</span>],
                  ['AI-Native Curriculum (2025)', <span className="check-y">✓ Core offering</span>, <span className="check-n">✗ Slow to update*</span>, <span className="check-n">✗ Build from scratch</span>],
                  ['No Coding Skills Required', <span className="check-y">✓ Facilitator model</span>, <span className="check-y">✓ Non-coder friendly</span>, <span className="check-m">◐ Depends</span>],
                  ['Curriculum Updates Included', <span className="check-y">✓ Quarterly, free</span>, <span className="check-y">✓ Proprietary system</span>, <span className="check-n">✗ You pay for it</span>],
                  ['Character / Virtue Framework', <span className="check-y">✓ 7 Bushido Virtues</span>, <span className="check-m">◐ Belt system only</span>, <span className="check-n">✗ Build your own</span>],
                  ['Break-Even Timeline', '3–6 months', '12–36 months', '6–24 months (variable)'],
                  ['Small Market / Rural Viable', <span className="check-y">✓ Designed for it</span>, <span className="check-n">✗ Requires dense suburbs</span>, <span className="check-m">◐ Possible</span>],
                  ['Franchisee Satisfaction (2025)', <span className="check-y">✓ Teacher-designed</span>, <span className="check-n">✗ 2.5/5 (franchisee reviews)</span>, 'N/A'],
                  ['Sibling + Adult Revenue Streams', <span className="check-y">✓ Built in</span>, <span className="check-m">◐ Limited</span>, <span className="check-m">◐ You build it</span>],
                ].map(([feature, ss, cn, ind], i) => (
                  <tr key={i}>
                    <td className="row-label">{feature}</td>
                    <td className="highlight">{ss}</td>
                    <td>{cn}</td>
                    <td>{ind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '0.7rem', color: 'var(--faint)', marginTop: '0.75rem', textAlign: 'right' }}>
              *Per franchisee reviews: "slow pace of response to technological change" — Wefranch.com, 2025
            </p>
          </div>
        </div>
      </section>

      {/* ─── FRANCHISEE TESTIMONIALS ─── */}
      <section className="franchisee-proof">
        <div className="fp-inner">
          <div className="fp-header reveal">
            <div>
              <div className="section-label-gold">From the Field</div>
              <h2>Franchisees Who Made the Leap</h2>
            </div>
            <p>Former teachers. Real numbers. Honest perspectives.</p>
          </div>

          <div className="fp-grid reveal">
            <div className="fp-card featured">
              <div className="fp-stars">★★★★★</div>
              <p className="fp-quote">"I spent 17 years in the classroom waiting to feel this sense of ownership over my work. In my first semester I enrolled 52 kids in a town of 22,000 people — a town Code Ninjas would never touch because the 'territory doesn't qualify.' That's my competitive advantage. I'm the only one here."</p>
              <div className="fp-author">
                <div className="fp-avatar">👩‍🏫</div>
                <div className="fp-author-info">
                  <span className="fp-author-name">Sandra K. — Former 5th Grade Teacher</span>
                  <span className="fp-author-detail">Skill Samurai · Owensboro, KY · Month 8</span>
                </div>
                <div className="fp-revenue-chip">$3,100/mo net</div>
              </div>
            </div>

            <div className="fp-card">
              <div className="fp-stars">★★★★★</div>
              <p className="fp-quote">"I was skeptical because I don't code. But I've run a classroom for 22 years — I know how to manage 12 kids building things and getting excited and needing redirection. Turns out that's 90% of this job. The curriculum handles the rest."</p>
              <div className="fp-author">
                <div className="fp-avatar">👨‍🏫</div>
                <div className="fp-author-info">
                  <span className="fp-author-name">Marcus T. — Retired PE Teacher</span>
                  <span className="fp-author-detail">Skill Samurai · Murfreesboro, TN · Month 11</span>
                </div>
                <div className="fp-revenue-chip">$2,800/mo net</div>
              </div>
            </div>

            <div className="fp-card">
              <div className="fp-stars">★★★★★</div>
              <p className="fp-quote">"The Bushido framework is what sold me. I was looking at a couple of coding franchise options and they all felt like tech products. Skill Samurai felt like an educational philosophy with technology as the vehicle. That's what I wanted to sell parents."</p>
              <div className="fp-author">
                <div className="fp-avatar">👩</div>
                <div className="fp-author-info">
                  <span className="fp-author-name">Angela R. — Former Middle School VP</span>
                  <span className="fp-author-detail">Skill Samurai · Flagstaff, AZ · Month 6</span>
                </div>
                <div className="fp-revenue-chip">$2,200/mo net</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="f-faq">
        <div className="f-faq-inner">
          <div className="f-faq-header reveal">
            <div className="section-label-gold" style={{ justifyContent: 'center' }}>Franchise FAQ</div>
            <h2>Questions We Get Every Week</h2>
            <p>Straight answers. No franchise sales spin.</p>
          </div>

          {FAQS.map((item, i) => (
            <div key={i} className={`f-faq-item reveal${openFaq === i ? ' open' : ''}`}>
              <button className="f-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <span className="f-faq-toggle">+</span>
              </button>
              <div className="f-faq-answer">
                <div className="f-faq-answer-inner" dangerouslySetInnerHTML={{ __html: item.a }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="final-cta" id="apply">
        <div className="final-cta-inner">
          <div className="final-cta-content reveal">
            <div className="section-label-gold">Zero Pressure. Full Information.</div>
            <h2>
              The Lowest-Risk Path<br />to Owning Something<br />
              <span className="gold"><em>Genuinely Yours.</em></span>
            </h2>
            <p>
              We're not running a high-pressure franchise sales operation. We're a lean team looking for <strong>the right educators</strong> who want to do meaningful work in their community and build real income on their terms.
            </p>
            <p>
              Submitting this form gets you our complete Franchise Information Pack — the full financials, the curriculum overview, territory maps, sample marketing materials, and a 30-minute discovery call with a member of the founding team. No obligation. No sales calls unless you want them.
            </p>

            <div className="urgency-bar">
              <div className="urgency-dot" />
              <span><strong>Territory availability is limited.</strong> We approve one franchisee per territory. Several markets are already under review. Submitting your application reserves your territory for 14 days while we review your fit.</span>
            </div>

            <div className="hero-trust-row" style={{ borderTop: '1px solid var(--border)', marginTop: 0 }}>
              <div className="trust-pill-f"><span className="trust-pill-f-icon">✓</span><span>No obligation info pack</span></div>
              <div className="trust-pill-f"><span className="trust-pill-f-icon">✓</span><span>14-day territory hold</span></div>
              <div className="trust-pill-f"><span className="trust-pill-f-icon">✓</span><span>Response within 48 hours</span></div>
            </div>
          </div>

          {/* Application Form */}
          <div className="form-card reveal">
            <div className="form-card-header">
              <div className="form-card-title">⚔ Franchise Application</div>
              <div className="form-card-subtitle">Request Your Free<br />Franchise Information Pack</div>
            </div>
            {submitted ? (
              <div className="form-card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ color: 'var(--gold)', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Application Received!
                </p>
                <p style={{ color: 'var(--mist)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  We'll be in touch within 48 hours with your Franchise Info Pack and territory assessment. Redirecting to our contact page…
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div className="form-card-body">
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label" htmlFor="firstName">First Name</label>
                      <input id="firstName" name="firstName" type="text" className="form-input" placeholder="Sarah" value={form.firstName} onChange={handleFormChange} required />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="lastName">Last Name</label>
                      <input id="lastName" name="lastName" type="text" className="form-input" placeholder="Johnson" value={form.lastName} onChange={handleFormChange} required />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input id="email" name="email" type="email" className="form-input" placeholder="sarah@email.com" value={form.email} onChange={handleFormChange} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input id="phone" name="phone" type="tel" className="form-input" placeholder="(555) 000-0000" value={form.phone} onChange={handleFormChange} />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="location">City &amp; State</label>
                    <input id="location" name="location" type="text" className="form-input" placeholder="Nashville, TN" value={form.location} onChange={handleFormChange} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="background">Your Background</label>
                    <select id="background" name="background" className="form-select" value={form.background} onChange={handleFormChange} required>
                      <option value="" disabled>Select your background</option>
                      <option>Current K–12 Teacher</option>
                      <option>Recently Retired Educator</option>
                      <option>Former Teacher / Career Change</option>
                      <option>Education Administrator</option>
                      <option>Tech / Corporate Trainer</option>
                      <option>Parent / Community Member</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="investment">Available Investment Range</label>
                    <select id="investment" name="investment" className="form-select" value={form.investment} onChange={handleFormChange} required>
                      <option value="" disabled>Select range</option>
                      <option>$8,900–$15,000</option>
                      <option>$15,000–$25,000</option>
                      <option>$25,000+</option>
                      <option>Need financing options</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-form-submit">
                    ⚔ Send Me the Info Pack →
                  </button>
                </div>
                <div className="form-disclaimer">
                  We respond within 48 hours. Your information is never sold or shared.<br />
                  Submitting this form is not a commitment to purchase a franchise.
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="footer-left-f">SKILL <span>SAMURAI</span> · AI Makers Academy · Franchise Division</div>
        <div className="footer-links-f">
          <Link to={createPageUrl('Parents')}>Parent Page</Link>
          <Link to={createPageUrl('ProgramsBrowser')}>Curriculum</Link>
          <Link to={createPageUrl('Contact')}>FDD Request</Link>
          <Link to={createPageUrl('PrivacyPolicy')}>Privacy Policy</Link>
          <Link to={createPageUrl('Contact')}>Contact</Link>
        </div>
        <div className="footer-right-f">© 2025 Skill Samurai. All rights reserved. Franchise offerings subject to FDD disclosure requirements.</div>
      </footer>

    </div>
  );
}
