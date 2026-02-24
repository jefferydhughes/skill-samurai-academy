import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/apiClient';
import { Menu, X, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Programs', href: createPageUrl('ProgramsBrowser') },
  { label: 'Camps', href: createPageUrl('CampBrowser') },
  { label: 'Locations', href: createPageUrl('Locations') },
  { label: 'About', href: createPageUrl('About') },
  { label: 'Contact', href: createPageUrl('Contact') },
  { label: 'Franchising', href: createPageUrl('Franchising') },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.auth.me().then(setUserProfile).catch(() => {});
    } else {
      setUserProfile(null);
    }
  }, [isAuthenticated]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const getDashboardUrl = () => {
    const role = userProfile?.role || userProfile?.userRole;
    if (role === 'teacher') return createPageUrl('TeacherPortal');
    if (role === 'admin' || role === 'location_manager') return createPageUrl('AdminDashboard');
    if (role === 'student') return createPageUrl('LearningWorlds');
    return createPageUrl('ParentDashboard');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md border-b border-slate-200/80'
          : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-2.5 flex-shrink-0 group">
            <img
              src="https://res.cloudinary.com/dr76535kj/image/upload/v1771936172/Untitled_design_geeauy.png"
              alt="Skill Samurai Academy"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="hidden sm:block leading-tight">
              <div className="font-bold text-slate-900 text-sm">Skill Samurai</div>
              <div className="text-slate-500 text-xs font-normal">Academy</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-9">
                <Link to={getDashboardUrl()}>My Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 rounded-xl h-9">
                  <Link to={createPageUrl('Login')}>Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-5 h-9 shadow-md shadow-indigo-500/20"
                >
                  <Link to={createPageUrl('BookTrial')}>Book Free Trial</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/60 bg-white shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="px-4 pt-3 pb-2 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-5 pt-2 border-t border-slate-100 space-y-2.5">
            {isAuthenticated ? (
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 text-base">
                <Link to={getDashboardUrl()}>My Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full rounded-xl h-11 text-base border-slate-300">
                  <Link to={createPageUrl('Login')}>Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl h-11 text-base"
                >
                  <Link to={createPageUrl('BookTrial')}>Book Free Trial</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
