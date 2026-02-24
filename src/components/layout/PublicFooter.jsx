import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mail, MapPin } from 'lucide-react';

// Inline SVG social icons (lucide-react does not include brand icons)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47a2.78 2.78 0 0 0-1.95 1.95A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: FacebookIcon, href: 'https://facebook.com/skillsamurai' },
  { label: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com/skillsamurai' },
  { label: 'Twitter / X', icon: TwitterIcon, href: 'https://twitter.com/skillsamurai' },
  { label: 'YouTube', icon: YouTubeIcon, href: 'https://youtube.com/@skillsamurai' },
];

function FooterLinkGroup({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {'to' in link ? (
              <Link to={link.to} className="text-slate-400 hover:text-white text-sm transition-colors duration-150">
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-slate-400 hover:text-white text-sm transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PublicFooter() {
  const year = new Date().getFullYear();

  const footerGroups = [
    {
      title: 'Programs',
      links: [
        { label: 'Weekly Classes', to: createPageUrl('ProgramsBrowser') },
        { label: 'Holiday Camps', to: createPageUrl('CampBrowser') },
        { label: 'Course Catalogue', to: createPageUrl('CourseCatalogue') },
        { label: 'Book a Free Trial', to: createPageUrl('BookTrial') },
        { label: 'Find a Location', to: createPageUrl('Locations') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', to: createPageUrl('About') },
        { label: 'Franchising', to: createPageUrl('Franchising') },
        { label: 'Contact Us', to: createPageUrl('Contact') },
        { label: 'Sign In', to: createPageUrl('Login') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', to: createPageUrl('PrivacyPolicy') },
        { label: 'Terms of Service', to: createPageUrl('TermsOfService') },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 mb-5 group w-fit">
              <img
                src="https://res.cloudinary.com/dr76535kj/image/upload/v1771936172/Untitled_design_geeauy.png"
                alt="Skill Samurai Academy"
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-tight">
                <div className="font-bold text-white text-sm">Skill Samurai</div>
                <div className="text-slate-400 text-xs">Academy</div>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-[260px]">
              Empowering kids ages 5–18 with coding, STEM, and critical-thinking skills in a fun, community-based environment.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 mb-6">
              <a
                href="mailto:hello@skillsamurai.academy"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0 text-slate-500" />
                hello@skillsamurai.academy
              </a>
              <Link
                to={createPageUrl('Locations')}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <MapPin className="w-4 h-4 flex-shrink-0 text-slate-500" />
                Find your nearest location
              </Link>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors duration-150"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link groups */}
          {footerGroups.map((group) => (
            <FooterLinkGroup key={group.title} title={group.title} links={group.links} />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center sm:text-left">
            &copy; {year} Skill Samurai Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to={createPageUrl('TermsOfService')} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to={createPageUrl('Contact')} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
