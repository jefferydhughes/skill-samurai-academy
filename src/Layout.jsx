import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { api } from '@/api/apiClient';
import {
  BookOpen,
  Calendar,
  Users,
  Settings,
  GraduationCap,
  Rocket,
  Trophy,
  BarChart3,
  Building2,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Blocks
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIChatbot from '@/components/ai/AIChatbot';
import { CartProvider } from '@/components/checkout/CartContext';
import CheckoutCartWrapper from '@/components/checkout/CheckoutCartWrapper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

// Pages that get the public marketing layout (header + footer)
const PUBLIC_PAGES = [
  'Home', 'About', 'Contact', 'PrivacyPolicy', 'TermsOfService',
  'Franchising', 'BookTrial', 'BookingFlow', 'ProgramsBrowser',
  'CampBrowser', 'CampCatalogue', 'CourseCatalogue', 'Locations',
  'LocationDetail', 'CheckoutSuccess', 'Login', 'HowBeAKidWorks',
];

// Pages that render full-screen with no layout chrome
const FULLSCREEN_PAGES = ['KitsuneLesson2D', 'LessonPlayer', 'EpicModeEditor', 'Parents', 'FranchiseOpportunities'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      // User not logged in
    }
  };

  // ── Full-screen pages (no chrome) ──────────────────────────────────────────
  if (FULLSCREEN_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }

  // ── Public marketing pages ─────────────────────────────────────────────────
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return (
      <CartProvider>
        {/* Fixed header */}
        <PublicHeader />

        {/* Push content below fixed header for all public pages except Home.
            Home manages its own hero padding (pt-32) against the fixed header. */}
        {currentPageName !== 'Home' && (
          <div className="h-16" aria-hidden="true" />
        )}

        <main>
          {children}
        </main>

        <PublicFooter />
        <CheckoutCartWrapper />
      </CartProvider>
    );
  }

  // ── Portal / dashboard pages ───────────────────────────────────────────────
  const handleLogout = () => {
    api.auth.logout();
  };

  const getNavItems = () => {
    const role = user?.userRole || user?.role || 'parent';

    if (role === 'teacher') {
      return [
        { name: 'Curriculum', page: 'CurriculumManager', icon: GraduationCap, emoji: '📚' },
        { name: 'Courses', page: 'CourseCatalogue', icon: BookOpen, emoji: '📖' },
        { name: 'Lessons', page: 'LessonsManager', icon: Blocks, emoji: '📘' },
        { name: 'Students', page: 'StudentEnrollmentManager', icon: Users, emoji: '👨‍🎓' },
        { name: 'Progress', page: 'TeacherProgress', icon: BarChart3, emoji: '📊' },
      ];
    }

    if (role === 'admin' || role === 'instructor') {
      return [
        { name: 'Academy', page: 'AdminDashboard', icon: Building2, emoji: '🏫' },
        { name: 'Finance', page: 'FinancialDashboard', icon: CreditCard, emoji: '💰' },
        { name: 'Curriculum', page: 'CurriculumManager', icon: GraduationCap, emoji: '📚' },
        { name: 'Courses', page: 'CourseCatalogue', icon: BookOpen, emoji: '📖' },
        { name: 'Camps', page: 'CampCatalogue', icon: Calendar, emoji: '🏕️' },
        { name: 'Students', page: 'StudentEnrollmentManager', icon: Users, emoji: '👨‍🎓' },
        { name: 'Badges', page: 'BadgeManager', icon: Trophy, emoji: '🏆' },
        { name: 'Reports', page: 'Reports', icon: BarChart3, emoji: '📊' },
      ];
    }

    if (role === 'student') {
      return [
        { name: 'My Worlds', page: 'LearningWorlds', icon: Rocket, emoji: '🎮', primary: true },
        { name: 'Lessons', page: 'StudentLessons', icon: BookOpen, emoji: '🧠' },
        { name: 'Achievements', page: 'Achievements', icon: Trophy, emoji: '🏆' },
        { name: 'Progress', page: 'StudentProgress', icon: BarChart3, emoji: '📈' },
      ];
    }

    return [
      { name: 'Dashboard', page: 'ParentDashboard', icon: Building2, emoji: '🏠' },
      { name: 'Programs', page: 'ProgramsBrowser', icon: BookOpen, emoji: '📚' },
      { name: 'Bookings', page: 'MyBookings', icon: Calendar, emoji: '🗓' },
      { name: 'Children', page: 'MyChildren', icon: Users, emoji: '👨‍👩‍👧' },
      { name: 'Progress', page: 'ParentReports', icon: Rocket, emoji: '🎮' },
      { name: 'Billing', page: 'Billing', icon: CreditCard, emoji: '💳' },
    ];
  };

  const navItems = getNavItems();
  const isStudent = (user?.userRole || user?.role) === 'student';

  return (
    <CartProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <style>{`
          * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, "Helvetica Neue", Arial, sans-serif;
          }
        `}</style>

        {/* Top Bar */}
        <header className="h-16 border-b border-white/50 bg-white/60 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <img
                src="https://res.cloudinary.com/dr76535kj/image/upload/v1771936172/Untitled_design_geeauy.png"
                alt="Skill Samurai Academy"
                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hidden sm:inline">Skill Samurai</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/80">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white"></span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 h-10 px-3 rounded-xl hover:bg-white/80">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                      {user.full_name || 'User'}
                    </span>
                    {user.userRole && (
                      <Badge variant="secondary" className="hidden lg:inline-flex text-xs capitalize bg-indigo-100 text-indigo-700 border-0">
                        {user.userRole}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white/95 backdrop-blur-xl border-white/50 shadow-xl">
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link to={createPageUrl('Settings')} className="flex items-center gap-3 py-3">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-xl py-3">
                    <LogOut className="w-4 h-4 mr-3" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
              >
                <Link to={createPageUrl('Login')}>Sign In</Link>
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <aside
            className={`
              hidden md:flex flex-col border-r border-white/50 bg-white/40 backdrop-blur-xl transition-all duration-200 flex-shrink-0
              ${sidebarExpanded ? 'w-[220px]' : 'w-[56px]'}
            `}
          >
            <nav className="flex-1 p-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;

                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`
                      flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-semibold transition-all
                      ${isActive
                        ? isStudent
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-white/60 hover:shadow-sm'
                      }
                      ${item.primary && isStudent ? 'ring-2 ring-indigo-200' : ''}
                    `}
                    title={!sidebarExpanded ? item.name : ''}
                  >
                    {isStudent ? (
                      <span className="text-lg">{item.emoji}</span>
                    ) : (
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    )}
                    {sidebarExpanded && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="p-2 border-t border-white/30">
              <Link
                to={createPageUrl('Settings')}
                className={`
                  flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-semibold transition-all
                  ${currentPageName === 'Settings'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-white/60 hover:shadow-sm'
                  }
                `}
                title={!sidebarExpanded ? 'Settings' : ''}
              >
                {isStudent ? (
                  <span className="text-lg">⚙️</span>
                ) : (
                  <Settings className="w-5 h-5 flex-shrink-0" />
                )}
                {sidebarExpanded && <span>Settings</span>}
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="w-full mt-2 h-9 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/60"
              >
                {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </aside>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-white/50 shadow-2xl">
            <div className="flex items-center justify-around px-2 py-2">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;

                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`
                      flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-1 max-w-[100px]
                      ${isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg'
                        : 'text-slate-600'
                      }
                    `}
                  >
                    {isStudent ? (
                      <span className="text-xl">{item.emoji}</span>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    <span className="text-[10px] font-semibold">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Main Workspace */}
          <main className="flex-1 overflow-auto">
            <div className="h-full p-6 md:p-8 pb-24 md:pb-8">
              {children}
            </div>
          </main>
        </div>

        {/* AI Chatbot */}
        <AIChatbot />

        {/* Checkout Cart */}
        <CheckoutCartWrapper />
      </div>
    </CartProvider>
  );
}
