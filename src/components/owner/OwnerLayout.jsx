import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { 
  LayoutDashboard, 
  Calendar, 
  Tent,
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { name: 'Dashboard', page: 'OwnerDashboard', icon: LayoutDashboard },
  { name: 'Schedule', page: 'OwnerSchedule', icon: Calendar },
  { name: 'Camps', page: 'OwnerCamps', icon: Tent },
  { name: 'Students', page: 'OwnerStudents', icon: Users },
  { name: 'Reports', page: 'OwnerReports', icon: BarChart3 },
  { name: 'Settings', page: 'OwnerSettings', icon: Settings },
];

export default function OwnerLayout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadLocations();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const loadLocations = async () => {
    const locs = await api.entities.Location.list();
    setLocations(locs);
    if (locs.length > 0 && !selectedLocation) {
      setSelectedLocation(locs[0]);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2A4169] text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EE3E86] to-[#A3DAE8] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Skill Samurai</h1>
              <p className="text-xs text-white/60">Owner Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`
                  flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-semibold transition-all
                  ${isActive 
                    ? 'bg-[#EE3E86] text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#2A4169]">
              {navItems.find(item => item.page === currentPageName)?.name || 'Owner Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Location Selector */}
            {locations.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    {selectedLocation?.name || 'Select Location'}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {locations.map((loc) => (
                    <DropdownMenuItem
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                    >
                      {loc.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EE3E86] to-[#A3DAE8] flex items-center justify-center text-white text-sm font-semibold">
                  {user.full_name?.[0]?.toUpperCase() || 'O'}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {user.full_name || 'Owner'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}