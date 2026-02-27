import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import './Parents.css';

// Simple scroll-reveal hook using IntersectionObserver
function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));

    // Stagger child items in grids
    document.querySelectorAll('.testimonials-grid, .steps-grid, .results-stats, .alt-cta-grid').forEach((grid) => {
      grid.querySelectorAll(':scope > *').forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.1}s`;
      });
    });

    return () => observer.disconnect();
  }, []);
}

// ── SVG Logo Mon ────────────────────────────────────────────────────────────
function NavMon() {
  return (
    <svg className="nav-mon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill="#0d0d0d" stroke="#c9962a" strokeWidth="2"/>
      <path d="M40 12 L55 30 L68 28 L58 42 L65 58 L50 52 L40 68 L30 52 L15 58 L22 42 L12 28 L25 30 Z" fill="none" stroke="#c8202c" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="40" cy="40" r="8" fill="#c9962a"/>
      <path d="M34 40 L38 44 L48 34" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function HeroMon() {
  return (
    <svg className="mon-large" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="86" fill="rgba(255,255,255,0.04)" stroke="#c9962a" strokeWidth="1.5"/>
      <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(201,150,42,0.2)" strokeWidth="1"/>
      <path d="M90 20 L112 50 L145 45 L128 74 L140 108 L108 97 L90 125 L72 97 L40 108 L52 74 L35 45 L68 50 Z" fill="none" stroke="#c8202c" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="90" cy="90" r="20" fill="rgba(201,150,42,0.15)" stroke="#c9962a" strokeWidth="1.5"/>
      <text x="90" y="98" fontFamily="serif" fontSize="22" fill="#c9962a" textAnchor="middle">武</text>
    </svg>
  );
}

// ── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`faq-item reveal${isOpen ? ' open' : ''}`}>
      <button className="faq-question" onClick={onToggle}>
        {question}
        <span className="faq-toggle">+</span>
      </button>
      <div className="faq-answer">
        <div className="faq-answer-inner" dangerouslySetInnerHTML={{ __html: answer }} />
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    question: 'My child has zero coding experience. Is this really for them?',
    answer: 'Absolutely — and honestly, <strong>complete beginners often learn the fastest here</strong> because they have no bad habits to unlearn. Our White Belt level starts with AI storytelling and game art, where your child describes what they want to create and AI helps bring it to life. They\'re making real things from day one, no prior experience required. The first class is free so you can see for yourself before spending a cent.',
  },
  {
    question: 'How is this different from YouTube tutorials or apps like Scratch?',
    answer: 'Three things make the difference: <strong>a real human instructor, real accountability, and real outcomes.</strong> YouTube can teach skills, but it can\'t celebrate your child\'s breakthrough, push them past a frustrating bug, or build the relationships that make learning sticky. Scratch teaches block-based coding — foundational, but frozen in 2010. We use the AI tools that professionals actually use today: Replit, Canva AI, Cursor, and more. And every session has a finish line — something to ship, share, and be proud of. No tutorial ends with a Demo Day where your kid presents to a room full of proud parents.',
  },
  {
    question: 'What exactly are the "7 Virtues of Bushido" and why do they matter?',
    answer: 'Bushido is the ancient samurai code of conduct — a framework for excellence and ethical behavior that has guided warriors and craftspeople for centuries. We apply the 7 virtues — Rectitude, Courage, Benevolence, Respect, Honesty, Honor, and Loyalty — as a <strong>living framework for how students approach their work and each other.</strong> Courage means shipping a project even when it\'s imperfect. Benevolence means building something for someone else. Honesty means owning when AI did the heavy lifting versus when your thinking led the way. These aren\'t slogans — they\'re practiced and reflected on in every class. Parents consistently tell us the virtues "leak out" into other areas of their child\'s life.',
  },
  {
    question: 'Will AI make coding skills irrelevant? Why bother learning this now?',
    answer: 'This is the most important question parents ask, and here\'s the honest answer: <strong>AI raises the stakes for kids who understand how to use it, and eliminates opportunities for those who don\'t.</strong> The children who will thrive in the next decade aren\'t the ones who can type fastest — they\'re the ones who know how to think clearly, direct AI tools effectively, spot errors in AI output, and build things that actually work. That\'s exactly what we teach. Think of it like driving: GPS exists, but you still need to know how to drive. We teach kids to be the driver, not the passenger.',
  },
  {
    question: 'How much does it cost and what\'s included?',
    answer: 'Monthly enrollment starts at <strong>$99/month</strong>, which includes two sessions per week, all curriculum materials, access to our AI tool suite, and participation in quarterly Demo Days. Siblings receive automatic discounts. There are <strong>no registration fees, no equipment to purchase, no uniform to buy</strong> — just sneakers and a curious kid. And there\'s no contract — we believe programs should earn continued enrollment by being great, not by locking families in. Try the first class free and decide from there.',
  },
  {
    question: 'Where exactly are classes held? Do I have to drive far?',
    answer: 'We intentionally operate in community spaces — <strong>church gyms, school meeting rooms, library halls, and community centers</strong> — places your family already knows and trusts. This keeps our costs (and your fees) dramatically lower than programs locked into expensive retail leases, and it means we can reach communities that larger programs never will. When you sign up, we\'ll show you the exact location nearest you. Classes are typically on Saturday mornings and one weekday afternoon.',
  },
  {
    question: 'My child already knows some coding. Will they be bored?',
    answer: 'Great news — experienced coders typically love Skill Samurai <strong>more</strong> than beginners do, because they immediately see the power of combining what they already know with AI tools. A kid who can write Python and suddenly learns to use Cursor AI is like a carpenter who just got a power saw. We\'ll place them in the right belt level from day one, and experienced students often become informal mentors in sessions — which is one of the most powerful learning experiences we offer.',
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function Parents() {
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useScrollReveal();

  const handleToggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    navigate(`${createPageUrl('BookTrial')}${email ? `?email=${encodeURIComponent(email)}` : ''}`);
  };

  return (
    <div className="parents-page">

      {/* ─── NAV ─── */}
      <nav>
        <Link to={createPageUrl('Home')} className="nav-logo">
          <NavMon />
          <div className="nav-wordmark">
            SKILL SAMURAI
            <span>AI Makers Academy</span>
          </div>
        </Link>
        <Link to={createPageUrl('BookTrial')} className="nav-cta">Claim Your Free Class →</Link>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">Now Enrolling · Ages 6–18</div>

          <h1 className="hero-headline">
            <span className="thin">Your Child Won't</span>
            <span className="accent">Just Learn AI.</span>
            They'll Command It.
          </h1>

          <p className="hero-subhead">
            While other kids swipe through AI, yours will be the one who builds it.
          </p>

          <p className="hero-body">
            Skill Samurai is the <strong>AI Makers Academy</strong> where children ages 6–18 learn to design games, build apps, and create digital products using the same AI tools reshaping the world — guided by the timeless virtues of the Bushido code. No experience needed. Just sneakers and curiosity.
          </p>

          <div className="hero-actions">
            <Link to={createPageUrl('BookTrial')} className="btn-primary">
              🎯 Claim Your First Class Free <span className="arrow">→</span>
            </Link>
            <div className="hero-trust">
              <div className="hero-trust-icons">
                <div className="trust-avatar">M</div>
                <div className="trust-avatar">J</div>
                <div className="trust-avatar">S</div>
                <div className="trust-avatar">R</div>
              </div>
              <span>Joined by 2,400+ families this year · No contracts · Cancel anytime</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual">
            <HeroMon />

            <div className="project-cards">
              <div className="project-card">
                <div className="project-card-emoji">🎮</div>
                <div className="project-card-title">Space Defender</div>
                <div className="project-card-sub">Built by Maya, age 9</div>
                <div className="project-card-badge">White Belt</div>
              </div>
              <div className="project-card">
                <div className="project-card-emoji">📱</div>
                <div className="project-card-title">School Helper App</div>
                <div className="project-card-sub">Built by Liam, age 12</div>
                <div className="project-card-badge">Blue Belt</div>
              </div>
              <div className="project-card">
                <div className="project-card-emoji">🎨</div>
                <div className="project-card-title">AI Comic Strip</div>
                <div className="project-card-sub">Built by Sofia, age 7</div>
                <div className="project-card-badge">White Belt</div>
              </div>
              <div className="project-card">
                <div className="project-card-emoji">🤖</div>
                <div className="project-card-title">Homework Bot</div>
                <div className="project-card-sub">Built by Ethan, age 14</div>
                <div className="project-card-badge">Black Belt</div>
              </div>
            </div>

            <div className="hero-stat-row">
              <div className="hero-stat">
                <span className="hero-stat-num">11</span>
                <span className="hero-stat-label">Years Teaching</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">5</span>
                <span className="hero-stat-label">Belt Levels</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">7</span>
                <span className="hero-stat-label">Bushido Virtues</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM MARQUEE BAR ─── */}
      <div className="problem-bar">
        <div className="problem-bar-label">What Kids Are NOT Learning Elsewhere</div>
        <div className="problem-bar-items">
          {[
            'How to use AI as a creative tool',
            'How to build real things, not just tutorials',
            'How to think like a problem-solver',
            'How to direct AI, not just follow it',
            'How to ship and present their own work',
            'How to use AI as a creative tool',
            'How to build real things, not just tutorials',
            'How to think like a problem-solver',
            'How to direct AI, not just follow it',
            'How to ship and present their own work',
          ].map((text, i) => (
            <div key={i} className="problem-item">{text}</div>
          ))}
        </div>
      </div>

      {/* ─── BENEFITS ─── */}
      <section className="benefits">
        <div className="benefits-intro reveal">
          <div className="section-label" style={{ justifyContent: 'center' }}>Why Skill Samurai Is Different</div>
          <h2>Three Reasons Parents Switch<br />and Never Look Back</h2>
          <p>Every coding program teaches kids to code. We teach them to <em>build</em>, to <em>think</em>, and to <em>lead</em> — using the tools that are actually reshaping the world.</p>
        </div>

        {/* BENEFIT 1 */}
        <div className="benefit-block reveal">
          <div className="benefit-visual benefit-visual-1">
            <div className="benefit-visual-inner">
              <span className="benefit-icon-large">🚀</span>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Real Projects Your Kid Can Show Anyone</p>
              <div className="project-cards" style={{ maxWidth: '280px' }}>
                <div className="project-card">
                  <div className="project-card-emoji">🌐</div>
                  <div className="project-card-title">My Portfolio Site</div>
                  <div className="project-card-badge">Week 2</div>
                </div>
                <div className="project-card">
                  <div className="project-card-emoji">🎮</div>
                  <div className="project-card-title">Platformer Game</div>
                  <div className="project-card-badge">Week 4</div>
                </div>
              </div>
            </div>
          </div>
          <div className="benefit-content">
            <span className="benefit-num">01</span>
            <div className="section-label">Ship Something Real</div>
            <h3>They Leave Every Session<br />with Something <em>They Built.</em></h3>
            <p>
              At Skill Samurai, we have one rule: <strong>no empty tutorials.</strong> Every 8-week module ends with a project your child can show at the dinner table, send to grandma, or post online — a real game, a working app prototype, an animated story, a digital business.
            </p>
            <p>
              Using AI tools like Canva AI for art, Replit for code, and Bolt.new for apps, students don't just learn <em>about</em> technology — they use technology to <strong>make something they're genuinely proud of.</strong>
            </p>
            <div className="benefit-proof-box">
              <p>"By week two, my 9-year-old had built a game and was explaining it to our neighbors. That had never happened in two years of other coding programs."</p>
              <cite>— Parent of Maya G., White Belt · Raleigh, NC</cite>
            </div>
          </div>
        </div>

        {/* BENEFIT 2 */}
        <div className="benefit-block reverse reveal">
          <div className="benefit-visual benefit-visual-2">
            <div className="benefit-visual-inner">
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>The 7 Virtues of Bushido</p>
              <ul className="virtue-list">
                <li><span className="virtue-kanji">義</span> Rectitude — Doing what is right</li>
                <li><span className="virtue-kanji">勇</span> Courage — Shipping imperfect work</li>
                <li><span className="virtue-kanji">仁</span> Benevolence — Building for others</li>
                <li><span className="virtue-kanji">礼</span> Respect — For peers and process</li>
                <li><span className="virtue-kanji">誠</span> Honesty — Owning mistakes</li>
                <li><span className="virtue-kanji">名</span> Honor — Excellence as a standard</li>
                <li><span className="virtue-kanji">忠</span> Loyalty — Showing up</li>
              </ul>
            </div>
          </div>
          <div className="benefit-content">
            <span className="benefit-num">02</span>
            <div className="section-label">Character Meets Craft</div>
            <h3>We Don't Just Teach Tech.<br />We Build <em>Character.</em></h3>
            <p>
              The 7 virtues of Bushido — the ancient warrior code — aren't decoration. They're baked into every project, every class, and every belt advancement. When a student pushes through a bug and finally ships their game, <strong>that's Courage.</strong> When they build an app for a family member, <strong>that's Benevolence.</strong>
            </p>
            <p>
              In a world where AI can generate anything, <strong>character and judgment are the irreplaceable human edge.</strong> We teach both — and parents tell us the virtues show up at home, at school, and everywhere else.
            </p>
            <ul className="check-list">
              <li>Each belt level is tied to a Bushido virtue, not just a technical skill</li>
              <li>Students reflect on their virtue practice in every session</li>
              <li>Belt ceremonies celebrate growth in both craft and character</li>
            </ul>
          </div>
        </div>

        {/* BENEFIT 3 */}
        <div className="benefit-block reveal">
          <div className="benefit-visual benefit-visual-3">
            <div className="benefit-visual-inner">
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Your Child's Learning Path</p>
              <div className="belt-display">
                <span className="belt belt-white">White</span>
                <span className="belt belt-yellow">Yellow</span>
                <span className="belt belt-green">Green</span>
                <span className="belt belt-blue">Blue</span>
                <span className="belt belt-black">Black</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', lineHeight: '1.8', textAlign: 'left', marginTop: '1rem' }}>
                <div>🎨 AI Storytelling &amp; Game Art · <span style={{ color: '#e8c46a' }}>Ages 6–8</span></div>
                <div>🎮 Vibe Coding &amp; Game Building · <span style={{ color: '#e8c46a' }}>Ages 8–10</span></div>
                <div>📱 App Prototyping · <span style={{ color: '#e8c46a' }}>Ages 10–12</span></div>
                <div>⚙️ AI Tools + Prompt Engineering · <span style={{ color: '#e8c46a' }}>Ages 12–14</span></div>
                <div>🚀 AI Startup Sprint · <span style={{ color: '#e8c46a' }}>Ages 14–18</span></div>
              </div>
            </div>
          </div>
          <div className="benefit-content">
            <span className="benefit-num">03</span>
            <div className="section-label">Right Here. Right Price.</div>
            <h3>Elite AI Education in<br /><em>Your</em> Neighborhood.</h3>
            <p>
              The best coding programs in America are clustered in wealthy suburbs and require $200+/month with multi-month contracts. We've built something different: <strong>a high-quality, AI-native program that meets your family where you are.</strong>
            </p>
            <p>
              Classes are held in community spaces — church gyms, school rooms, library halls — which keeps our costs (and your fees) dramatically lower. <strong>No commute. No intimidating "tech center." Just a community of makers in a space you already trust.</strong>
            </p>
            <ul className="check-list">
              <li>Flat monthly fee from $99 — no registration fees, no equipment needed</li>
              <li>Siblings get discounted enrollment automatically</li>
              <li>No long-term contracts — stay because your kid loves it</li>
              <li>Free first class, no commitment</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-it-works">
        <div className="hiw-inner">
          <div className="hiw-header reveal">
            <div className="section-label" style={{ justifyContent: 'center', color: '#c9962a' }}>Getting Started Is Simple</div>
            <h2>From Curious Kid to Confident Builder in 4 Steps</h2>
            <p>We've removed every barrier. All your child needs is a curious mind — and sneakers.</p>
          </div>
          <div className="steps-grid reveal">
            <div className="step">
              <div className="step-num">01</div>
              <h4>Claim Your Free Class</h4>
              <p>No credit card. No commitment. Just show up and see what your child is capable of making.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <h4>We Place Them in the Right Belt Level</h4>
              <p>A quick 5-minute chat tells us where to start — whether they've never touched a computer or they've been coding for years.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <h4>They Build Something Real</h4>
              <p>Every 8-week module ends with a project they own, can share, and are genuinely proud of. Watch them light up at Demo Day.</p>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <h4>They Earn Their Next Belt</h4>
              <p>Progress is visible, celebrated, and meaningful. Each belt represents real skills and real character growth — not just hours logged.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="social-proof">
        <div className="proof-header reveal">
          <div className="section-label" style={{ justifyContent: 'center' }}>Real Families. Real Results.</div>
          <h2>What Parents Are Saying</h2>
          <p>We let the work — and the kids — speak for themselves.</p>
        </div>

        <div className="testimonials-grid reveal">
          <div className="testimonial featured">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"I've tried three other coding programs. The difference with Skill Samurai isn't the technology — it's that my son actually <em>made something.</em> Not a tutorial. A real game that his friends downloaded and played. He went from refusing to do homework to staying up late to 'level up his build.' Whatever they're doing, it works."</p>
            <div className="testimonial-author">
              <div className="author-avatar">😊</div>
              <div className="author-info">
                <span className="author-name">Jennifer T.</span>
                <span className="author-detail">Mom of Marcus, 11 · Enrolled 14 months</span>
              </div>
              <div className="author-belt">Blue Belt Student</div>
            </div>
          </div>

          <div className="testimonial">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"My daughter is 7. She made a game for her little brother's birthday. She presented it to the whole family like a CEO. I have never seen her that proud of herself."</p>
            <div className="testimonial-author">
              <div className="author-avatar">👩</div>
              <div className="author-info">
                <span className="author-name">Rachel M.</span>
                <span className="author-detail">Mom of Lily, 7 · Charlotte, NC</span>
              </div>
              <div className="author-belt">White Belt</div>
            </div>
          </div>

          <div className="testimonial">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"We live 45 minutes from the nearest 'real' coding school. Skill Samurai came to our community center and it's the best thing that's happened to our neighborhood kids this year."</p>
            <div className="testimonial-author">
              <div className="author-avatar">👨</div>
              <div className="author-info">
                <span className="author-name">Carlos R.</span>
                <span className="author-detail">Dad of twins, 10 · Rural Ohio</span>
              </div>
              <div className="author-belt">Yellow Belt</div>
            </div>
          </div>

          <div className="testimonial">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"The Bushido virtues sound like a gimmick until you hear your 10-year-old explain why 'honesty means telling your teacher when you used AI to help, not to replace your thinking.' That's the conversation I needed."</p>
            <div className="testimonial-author">
              <div className="author-avatar">👩</div>
              <div className="author-info">
                <span className="author-name">Priya K.</span>
                <span className="author-detail">Mom of Rohan, 10 · Austin, TX</span>
              </div>
              <div className="author-belt">Yellow Belt</div>
            </div>
          </div>

          <div className="testimonial">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"At $109/month for two kids with the sibling discount, this is the single best value enrichment program we've ever found. And it's the only one they've ever asked to go back to."</p>
            <div className="testimonial-author">
              <div className="author-avatar">👨</div>
              <div className="author-info">
                <span className="author-name">David &amp; Amy S.</span>
                <span className="author-detail">Parents of 3 · Phoenix, AZ</span>
              </div>
              <div className="author-belt">3 Active Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <div className="trust-strip reveal">
        <div className="trust-item">
          <div className="trust-item-icon">🏅</div>
          <div className="trust-item-text">
            STEM Certified Curriculum
            <span>Aligned to CSTA standards</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-item-icon">📋</div>
          <div className="trust-item-text">
            Background-Checked Instructors
            <span>Credentialed educators only</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-item-icon">🔒</div>
          <div className="trust-item-text">
            No Contracts. Ever.
            <span>Stay because they love it</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-item-icon">💻</div>
          <div className="trust-item-text">
            No Equipment Needed
            <span>Just sneakers &amp; curiosity</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-item-icon">📅</div>
          <div className="trust-item-text">
            Free First Class
            <span>Zero commitment, zero risk</span>
          </div>
        </div>
      </div>

      {/* ─── RESULTS ─── */}
      <div className="results-section reveal">
        <div className="results-inner">
          <h2>The Numbers Behind 11 Years of Making Young Builders</h2>
          <div className="results-stats">
            <div className="result-stat">
              <span className="result-stat-num">94%</span>
              <div className="result-stat-text">of students build a shareable project in their first 8-week session</div>
            </div>
            <div className="result-stat">
              <span className="result-stat-num">3×</span>
              <div className="result-stat-text">longer average enrollment vs. national coding franchise average</div>
            </div>
            <div className="result-stat">
              <span className="result-stat-num">78%</span>
              <div className="result-stat-text">of enrolled families refer at least one friend or neighbor</div>
            </div>
            <div className="result-stat">
              <span className="result-stat-num">100%</span>
              <div className="result-stat-text">of instructors are former classroom educators with real teaching credentials</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <section className="faq">
        <div className="faq-inner">
          <div className="faq-header reveal">
            <div className="section-label" style={{ justifyContent: 'center' }}>Common Questions</div>
            <h2>Real Answers for Real Parents</h2>
            <p>We've heard these before. Here's the truth, no marketing spin.</p>
          </div>

          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openFaq === index}
              onToggle={() => handleToggleFaq(index)}
            />
          ))}
        </div>
      </section>

      {/* ─── MAIN CTA ─── */}
      <section className="cta-section" id="enroll">
        <div className="cta-inner">
          <div className="section-label" style={{ justifyContent: 'center', color: '#c9962a' }}>Zero Risk · Free First Class</div>

          <h2>
            Give Your Child the<br />
            <span className="gold">Unfair Advantage</span><br />
            They Deserve.
          </h2>

          <p>
            Join 2,400+ families who decided their kids would be builders, not bystanders. The first class is completely free. No card required. No commitment. Just show up.
          </p>

          <form className="cta-form" onSubmit={handleCtaSubmit}>
            <input
              type="email"
              className="cta-input"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="cta-submit">Claim Free Class →</button>
          </form>

          <p className="cta-disclaimer">
            By signing up, we'll contact you within 24 hours with available class times near you.<br />
            No spam. No pressure. Your information is never shared.
          </p>

          <div className="cta-alt-options">
            <h3>Other ways to get started</h3>
            <div className="alt-cta-grid">
              <Link to={createPageUrl('Contact')} className="alt-cta">
                <span className="alt-cta-icon">📅</span>
                <span className="alt-cta-title">Schedule a 15-Minute Call</span>
                <span className="alt-cta-sub">Talk to a real parent-educator who can answer your specific questions</span>
              </Link>
              <Link to={createPageUrl('About')} className="alt-cta">
                <span className="alt-cta-icon">🎬</span>
                <span className="alt-cta-title">Watch a Class in Action</span>
                <span className="alt-cta-sub">3-minute video showing exactly what a Skill Samurai session looks like</span>
              </Link>
              <Link to={createPageUrl('Locations')} className="alt-cta">
                <span className="alt-cta-icon">🗺️</span>
                <span className="alt-cta-title">Find a Location Near Me</span>
                <span className="alt-cta-sub">See which community spaces host classes in your area this month</span>
              </Link>
              <Link to={createPageUrl('BookTrial')} className="alt-cta">
                <span className="alt-cta-icon">🎁</span>
                <span className="alt-cta-title">Buy a Gift Enrollment</span>
                <span className="alt-cta-sub">Give a month of AI Maker classes as a birthday or holiday gift</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="footer-logo">SKILL SAMURAI ⚔ AI MAKERS ACADEMY</div>
        <div className="footer-links">
          <Link to={createPageUrl('About')}>About</Link>
          <Link to={createPageUrl('ProgramsBrowser')}>Curriculum</Link>
          <Link to={createPageUrl('Locations')}>Locations</Link>
          <Link to={createPageUrl('Franchising')}>Franchise</Link>
          <Link to={createPageUrl('PrivacyPolicy')}>Privacy</Link>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>© 2025 Skill Samurai. All rights reserved.</div>
      </footer>

    </div>
  );
}
