import { useState, useEffect, useCallback } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, Legend
} from "recharts";
import { 
  Building2, Users, Target, TrendingUp, AlertTriangle, CheckCircle2, 
  Clock, Calendar, MessageSquare, FileText, Plus, ChevronRight, 
  ChevronDown, MapPin, Star, ArrowUpRight, ArrowDownRight, Search, 
  Bell, Settings, LayoutDashboard, Store, Crosshair, Megaphone,
  BarChart3, ClipboardList, Mail, Phone, Globe, Shield, Eye,
  Edit3, Trash2, X, Check, AlertCircle, Activity, Zap, Award,
  BookOpen, Send, Filter, MoreVertical, ChevronLeft, UserPlus,
  Briefcase, DollarSign, Percent, Hash, PieChart as PieChartIcon
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const LOCATIONS = [
  { id: 1, name: "Sydney CBD", owner: "Marcus Chen", status: "active", region: "NSW", country: "Australia",
    fddSigned: "2023-03-15", openDate: "2023-06-01", seats: 13, maxClasses: 12,
    members: 89, target: 120, capacity: 156, attendance: 78, trials: 12, trialsCompleted: 9,
    cancellations: 2, newMembers: 7, suspensions: 3, mia14: 5, postcards: 15,
    weeklyData: [65, 68, 72, 75, 78, 80, 82, 85, 87, 88, 89, 89],
    rocks: [{name: "Reach 100 active members", progress: 74, onTrack: true}, 
            {name: "Launch robotics program", progress: 90, onTrack: true},
            {name: "Hire 2nd instructor", progress: 40, onTrack: false}],
    scorecard: {revenue: 42000, royalty: 2940, nps: 82, churn: 2.2},
    healthScore: 87, lastReport: "2026-02-24", reportStatus: "submitted" },
  { id: 2, name: "Melbourne South", owner: "Sarah Williams", status: "active", region: "VIC", country: "Australia",
    fddSigned: "2023-01-20", openDate: "2023-04-15", seats: 10, maxClasses: 10,
    members: 67, target: 100, capacity: 120, attendance: 58, trials: 8, trialsCompleted: 5,
    cancellations: 4, newMembers: 3, suspensions: 5, mia14: 8, postcards: 10,
    weeklyData: [45, 48, 52, 55, 58, 60, 62, 64, 65, 66, 67, 67],
    rocks: [{name: "Reduce churn to <3%", progress: 30, onTrack: false},
            {name: "Partnership with 3 schools", progress: 60, onTrack: true},
            {name: "Weekend workshop series", progress: 80, onTrack: true}],
    scorecard: {revenue: 31500, royalty: 2205, nps: 71, churn: 5.9},
    healthScore: 62, lastReport: "2026-02-24", reportStatus: "submitted" },
  { id: 3, name: "Brisbane North", owner: "James Park", status: "active", region: "QLD", country: "Australia",
    fddSigned: "2023-06-10", openDate: "2023-09-20", seats: 13, maxClasses: 12,
    members: 104, target: 130, capacity: 156, attendance: 92, trials: 15, trialsCompleted: 13,
    cancellations: 1, newMembers: 9, suspensions: 2, mia14: 3, postcards: 22,
    weeklyData: [70, 75, 80, 84, 88, 91, 94, 96, 99, 101, 103, 104],
    rocks: [{name: "Hit 130 members by Q2", progress: 80, onTrack: true},
            {name: "AI curriculum launch", progress: 95, onTrack: true},
            {name: "Community event monthly", progress: 100, onTrack: true}],
    scorecard: {revenue: 52000, royalty: 3640, nps: 91, churn: 0.9},
    healthScore: 94, lastReport: "2026-02-24", reportStatus: "submitted" },
  { id: 4, name: "Perth Central", owner: "Emma Thompson", status: "active", region: "WA", country: "Australia",
    fddSigned: "2024-01-05", openDate: "2024-04-01", seats: 10, maxClasses: 10,
    members: 45, target: 80, capacity: 120, attendance: 38, trials: 6, trialsCompleted: 4,
    cancellations: 3, newMembers: 4, suspensions: 4, mia14: 7, postcards: 8,
    weeklyData: [20, 24, 28, 31, 34, 36, 38, 40, 42, 43, 44, 45],
    rocks: [{name: "Reach 60 members", progress: 56, onTrack: false},
            {name: "Google reviews to 50+", progress: 70, onTrack: true},
            {name: "After-school program pilot", progress: 45, onTrack: false}],
    scorecard: {revenue: 22500, royalty: 1575, nps: 76, churn: 6.6},
    healthScore: 58, lastReport: "2026-02-17", reportStatus: "overdue" },
  { id: 5, name: "Adelaide Hills", owner: "Tom Rivera", status: "onboarding", region: "SA", country: "Australia",
    fddSigned: "2025-11-20", openDate: null, seats: 13, maxClasses: 12,
    members: 0, target: 50, capacity: 156, attendance: 0, trials: 0, trialsCompleted: 0,
    cancellations: 0, newMembers: 0, suspensions: 0, mia14: 0, postcards: 0,
    weeklyData: [0,0,0,0,0,0,0,0,0,0,0,0],
    rocks: [{name: "Complete buildout", progress: 65, onTrack: true},
            {name: "Pre-launch 30 leads", progress: 40, onTrack: false},
            {name: "Staff hired & trained", progress: 50, onTrack: true}],
    scorecard: {revenue: 0, royalty: 0, nps: 0, churn: 0},
    healthScore: 0, lastReport: null, reportStatus: "n/a" },
  { id: 6, name: "Cairo East", owner: "Ahmed Hassan", status: "prospect", region: "Cairo", country: "Egypt",
    fddSigned: null, openDate: null, seats: 13, maxClasses: 12,
    members: 0, target: 0, capacity: 156, attendance: 0, trials: 0, trialsCompleted: 0,
    cancellations: 0, newMembers: 0, suspensions: 0, mia14: 0, postcards: 0,
    weeklyData: [0,0,0,0,0,0,0,0,0,0,0,0],
    rocks: [],
    scorecard: {revenue: 0, royalty: 0, nps: 0, churn: 0},
    healthScore: 0, lastReport: null, reportStatus: "n/a" },
];

const ANNUAL_GOAL = { revenue: 750000, locations: 10, totalMembers: 600, avgNps: 85 };
const QUARTERLY_GOALS = [
  { q: "Q1", revenue: 175000, newLocations: 1, members: 350, status: "complete" },
  { q: "Q2", revenue: 190000, newLocations: 2, members: 420, status: "active" },
  { q: "Q3", revenue: 195000, newLocations: 1, members: 500, status: "upcoming" },
  { q: "Q4", revenue: 190000, newLocations: 1, members: 600, status: "upcoming" },
];

const ISSUES_LIST = [
  { id: 1, title: "Melbourne South churn rate above 5%", priority: "high", owner: "Jeff", status: "open", created: "2026-02-20" },
  { id: 2, title: "Perth Central missing weekly SNAP report", priority: "high", owner: "Emma Thompson", status: "open", created: "2026-02-25" },
  { id: 3, title: "Adelaide Hills buildout 2 weeks behind", priority: "medium", owner: "Tom Rivera", status: "in-progress", created: "2026-02-18" },
  { id: 4, title: "Curriculum v3 rollout documentation", priority: "medium", owner: "Jeff", status: "open", created: "2026-02-22" },
  { id: 5, title: "Cairo Egypt FDD localization review", priority: "low", owner: "Jeff", status: "open", created: "2026-02-15" },
];

const TODOS = [
  { id: 1, text: "Call Sarah re: Melbourne retention strategy", owner: "Jeff", due: "2026-03-03", done: false },
  { id: 2, text: "Review Perth Central marketing plan", owner: "Jeff", due: "2026-03-04", done: false },
  { id: 3, text: "Send Adelaide Hills construction checklist", owner: "Jeff", due: "2026-03-02", done: true },
  { id: 4, text: "Draft Egypt Ministry whitepaper update", owner: "Jeff", due: "2026-03-07", done: false },
  { id: 5, text: "Brisbane North - approve AI curriculum module", owner: "Jeff", due: "2026-03-05", done: false },
];

const HEADLINES = [
  { id: 1, type: "win", text: "Brisbane North hit 104 members — highest in network!", date: "2026-02-28" },
  { id: 2, type: "concern", text: "Melbourne South lost 4 members this week", date: "2026-02-28" },
  { id: 3, type: "info", text: "New Scratch platform beta ready for testing", date: "2026-02-27" },
  { id: 4, type: "win", text: "Sydney CBD NPS score improved to 82", date: "2026-02-26" },
];

const MESSAGES = [
  { id: 1, from: "Sarah Williams", location: "Melbourne South", text: "Can we discuss the retention plan in our next call? I have some ideas about a referral bonus.", time: "2h ago", unread: true },
  { id: 2, from: "James Park", location: "Brisbane North", text: "AI curriculum module 3 is complete. Kids are loving the voxel builder!", time: "5h ago", unread: true },
  { id: 3, from: "Emma Thompson", location: "Perth Central", text: "Sorry for the late SNAP report — had a staffing issue. Sent now.", time: "1d ago", unread: false },
  { id: 4, from: "Tom Rivera", location: "Adelaide Hills", text: "Buildout update: electrician delayed by a week. Adjusting timeline.", time: "2d ago", unread: false },
];

const WEEKLY_NUMBERS = ["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6","Week 7","Week 8","Week 9","Week 10","Week 11","Week 12"];
const CHART_COLORS = ["#0ea5e9","#8b5cf6","#f59e0b","#10b981","#ef4444","#6366f1"];

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    purple: "bg-violet-50 text-violet-700 border border-violet-200",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

function Card({ children, className = "", onClick }) {
  return <div onClick={onClick} className={`bg-white rounded-xl border border-slate-200 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:border-slate-300 transition-all" : ""} ${className}`}>{children}</div>;
}

function StatCard({ icon: Icon, label, value, change, changeType, subtitle, accent = "#0ea5e9" }) {
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5" style={{background: `radial-gradient(circle at top right, ${accent}, transparent)`}} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: `${accent}15`}}>
          <Icon size={20} style={{color: accent}} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs font-medium ${changeType === "up" ? "text-emerald-600" : "text-red-500"}`}>
            {changeType === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </Card>
  );
}

function ProgressBar({ value, max = 100, color = "#0ea5e9", height = 6, showLabel = true }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 rounded-full overflow-hidden" style={{height, background: "#f1f5f9"}}>
        <div className="h-full rounded-full transition-all duration-700" style={{width: `${pct}%`, background: color}} />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-600 w-10 text-right">{pct}%</span>}
    </div>
  );
}

function HealthDot({ score }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score > 0 ? "#ef4444" : "#94a3b8";
  return <div className="w-3 h-3 rounded-full" style={{background: color}} title={`Health: ${score}`} />;
}

function StatusBadge({ status }) {
  const map = { active: "success", onboarding: "info", prospect: "purple", paused: "warning", terminated: "danger" };
  return <Badge variant={map[status] || "default"}>{status}</Badge>;
}

function TabButton({ active, children, onClick, icon: Icon }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
        active ? "bg-sky-50 text-sky-700 shadow-sm border border-sky-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
          <Icon size={18} className="text-sky-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── MAIN APPLICATION ──────────────────────────────────────────────────────
export default function HeadOfficeAdmin() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [meetingSection, setMeetingSection] = useState("segue");

  const activeLocations = LOCATIONS.filter(l => l.status === "active");
  const totalMembers = activeLocations.reduce((s, l) => s + l.members, 0);
  const totalRevenue = activeLocations.reduce((s, l) => s + l.scorecard.revenue, 0);
  const avgNps = Math.round(activeLocations.reduce((s, l) => s + l.scorecard.nps, 0) / activeLocations.length);
  const totalRoyalty = activeLocations.reduce((s, l) => s + l.scorecard.royalty, 0);
  const avgChurn = (activeLocations.reduce((s, l) => s + l.scorecard.churn, 0) / activeLocations.length).toFixed(1);
  const overdue = LOCATIONS.filter(l => l.reportStatus === "overdue").length;
  const unreadMessages = MESSAGES.filter(m => m.unread).length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "locations", label: "Locations", icon: Store },
    { id: "scorecard", label: "Scorecard", icon: BarChart3 },
    { id: "rocks", label: "Rocks & Goals", icon: Target },
    { id: "l10", label: "Level 10 Meeting", icon: ClipboardList },
    { id: "communications", label: "Communications", icon: MessageSquare },
    { id: "compliance", label: "FDD & Compliance", icon: Shield },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  // ─── SIDEBAR ─────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300 flex flex-col ${sidebarCollapsed ? "w-16" : "w-60"}`}>
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="font-bold text-sm text-slate-900 leading-tight">Skill Samurai</div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Head Office</div>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveNav(item.id); setSelectedLocation(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeNav === item.id ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}>
            <item.icon size={18} className={activeNav === item.id ? "text-sky-600" : "text-slate-400"} />
            {!sidebarCollapsed && <span>{item.label}</span>}
            {!sidebarCollapsed && item.id === "communications" && unreadMessages > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadMessages}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-2 border-t border-slate-100">
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  );

  // ─── TOP BAR ─────────────────────────────────────────────────────────────
  const TopBar = () => (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search locations, owners, issues..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right mr-2">
          <div className="text-xs text-slate-400">Today</div>
          <div className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}</div>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-all">
          <Bell size={18} className="text-slate-500" />
          {(overdue + unreadMessages) > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">{overdue + unreadMessages}</span>}
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">JH</div>
      </div>
    </div>
  );

  // ─── DASHBOARD VIEW ──────────────────────────────────────────────────────
  const DashboardView = () => {
    const networkGrowth = WEEKLY_NUMBERS.map((w, i) => ({
      week: w,
      ...Object.fromEntries(activeLocations.map(l => [l.name, l.weeklyData[i] || 0])),
      total: activeLocations.reduce((s, l) => s + (l.weeklyData[i] || 0), 0)
    }));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Head Office Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Network performance overview — Week 12, 2026</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <Filter size={14} /> Filters
            </button>
            <button onClick={() => setShowAddLocation(true)} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 flex items-center gap-2 shadow-sm">
              <Plus size={14} /> Add Location
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatCard icon={Store} label="Active Locations" value={activeLocations.length} change="+1 this Q" changeType="up" accent="#6366f1" />
          <StatCard icon={Users} label="Total Members" value={totalMembers} change="+23 this week" changeType="up" subtitle={`Target: ${ANNUAL_GOAL.totalMembers}`} accent="#0ea5e9" />
          <StatCard icon={DollarSign} label="Network Revenue" value={`$${(totalRevenue/1000).toFixed(0)}K`} change="+8.2%" changeType="up" subtitle="Monthly" accent="#10b981" />
          <StatCard icon={Percent} label="Avg Churn" value={`${avgChurn}%`} change="0.3%" changeType="down" subtitle="Target: <3%" accent={parseFloat(avgChurn) > 3 ? "#f59e0b" : "#10b981"} />
          <StatCard icon={Star} label="Avg NPS" value={avgNps} change="+4pts" changeType="up" subtitle={`Target: ${ANNUAL_GOAL.avgNps}`} accent="#8b5cf6" />
          <StatCard icon={DollarSign} label="Royalties" value={`$${(totalRoyalty/1000).toFixed(1)}K`} subtitle="This month" accent="#f59e0b" />
        </div>

        {/* Annual Goal Progress */}
        <Card className="p-5">
          <SectionHeader icon={Target} title="2026 Annual Goal Progress" subtitle="EOS Vision/Traction Organizer — Annual targets" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
            {[
              { label: "Revenue", current: totalRevenue * 12, goal: ANNUAL_GOAL.revenue, fmt: v => `$${(v/1000).toFixed(0)}K` },
              { label: "Locations", current: LOCATIONS.filter(l => l.status !== "prospect").length, goal: ANNUAL_GOAL.locations, fmt: v => v },
              { label: "Total Members", current: totalMembers, goal: ANNUAL_GOAL.totalMembers, fmt: v => v },
              { label: "Avg NPS", current: avgNps, goal: ANNUAL_GOAL.avgNps, fmt: v => v },
            ].map((g, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">{g.label}</span>
                  <span className="text-slate-500">{g.fmt(g.current)} / {g.fmt(g.goal)}</span>
                </div>
                <ProgressBar value={g.current} max={g.goal} color={CHART_COLORS[i]} />
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Growth Chart */}
          <Card className="p-5 lg:col-span-2">
            <SectionHeader icon={TrendingUp} title="Network Member Growth" subtitle="12-week rolling trend by location" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{fontSize: 11}} stroke="#94a3b8" />
                  <YAxis tick={{fontSize: 11}} stroke="#94a3b8" />
                  <Tooltip contentStyle={{borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12}} />
                  {activeLocations.map((l, i) => (
                    <Area key={l.id} type="monotone" dataKey={l.name} stackId="1" stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Location Health */}
          <Card className="p-5">
            <SectionHeader icon={Activity} title="Location Health" subtitle="Click to drill down" />
            <div className="space-y-3">
              {LOCATIONS.filter(l => l.status !== "prospect").map(loc => (
                <button key={loc.id} onClick={() => { setSelectedLocation(loc); setActiveNav("locations"); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all text-left border border-slate-100">
                  <HealthDot score={loc.healthScore} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{loc.name}</div>
                    <div className="text-xs text-slate-500">{loc.members} members · {loc.owner}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{color: loc.healthScore >= 80 ? "#10b981" : loc.healthScore >= 60 ? "#f59e0b" : loc.healthScore > 0 ? "#ef4444" : "#94a3b8"}}>{loc.healthScore > 0 ? loc.healthScore : "—"}</div>
                    <div className="text-[10px] text-slate-400">{loc.status === "onboarding" ? "Onboarding" : "Health"}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Alerts & Headlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <SectionHeader icon={AlertCircle} title="Alerts & Action Items" subtitle="Requires your attention" />
            <div className="space-y-2">
              {overdue > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm text-red-700 font-medium">{overdue} location(s) with overdue SNAP reports</span>
                </div>
              )}
              {LOCATIONS.filter(l => l.scorecard.churn > 5).map(l => (
                <div key={l.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <TrendingUp size={16} className="text-amber-600" />
                  <span className="text-sm text-amber-700">{l.name}: Churn rate at {l.scorecard.churn}% (target &lt;3%)</span>
                </div>
              ))}
              {LOCATIONS.filter(l => l.mia14 > 5).map(l => (
                <div key={l.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-sm text-orange-700">{l.name}: {l.mia14} students MIA 14+ days</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionHeader icon={Megaphone} title="Headlines" subtitle="Recent network news" />
            <div className="space-y-2">
              {HEADLINES.map(h => (
                <div key={h.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  h.type === "win" ? "bg-emerald-50 border-emerald-100" : h.type === "concern" ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                  {h.type === "win" ? <Award size={16} className="text-emerald-600 mt-0.5" /> : h.type === "concern" ? <AlertTriangle size={16} className="text-red-500 mt-0.5" /> : <BookOpen size={16} className="text-slate-500 mt-0.5" />}
                  <div className="flex-1">
                    <div className="text-sm text-slate-800">{h.text}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{h.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // ─── LOCATIONS VIEW ──────────────────────────────────────────────────────
  const LocationsView = () => {
    if (selectedLocation) return <LocationDetail location={selectedLocation} onBack={() => setSelectedLocation(null)} />;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Franchise Locations</h1>
            <p className="text-sm text-slate-500 mt-1">{LOCATIONS.length} total locations across {new Set(LOCATIONS.map(l=>l.country)).size} countries</p>
          </div>
          <button onClick={() => setShowAddLocation(true)} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 flex items-center gap-2">
            <Plus size={14} /> Add Location
          </button>
        </div>

        <div className="grid gap-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Location</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-center">Health</div>
            <div className="col-span-1 text-center">Members</div>
            <div className="col-span-1 text-center">Target</div>
            <div className="col-span-1 text-center">NPS</div>
            <div className="col-span-1 text-center">Churn</div>
            <div className="col-span-1 text-center">Revenue</div>
            <div className="col-span-1 text-center">Report</div>
          </div>
          {LOCATIONS.map(loc => (
            <Card key={loc.id} onClick={() => setSelectedLocation(loc)} className="grid grid-cols-12 gap-4 px-5 py-4 items-center">
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <HealthDot score={loc.healthScore} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{loc.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} />{loc.region}, {loc.country} · {loc.owner}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-1"><StatusBadge status={loc.status} /></div>
              <div className="col-span-1 text-center text-sm font-bold" style={{color: loc.healthScore >= 80 ? "#10b981" : loc.healthScore >= 60 ? "#f59e0b" : loc.healthScore > 0 ? "#ef4444" : "#94a3b8"}}>{loc.healthScore || "—"}</div>
              <div className="col-span-1 text-center text-sm font-medium text-slate-700">{loc.members || "—"}</div>
              <div className="col-span-1 text-center text-sm text-slate-500">{loc.target || "—"}</div>
              <div className="col-span-1 text-center text-sm font-medium" style={{color: loc.scorecard.nps >= 80 ? "#10b981" : loc.scorecard.nps >= 70 ? "#f59e0b" : "#ef4444"}}>{loc.scorecard.nps || "—"}</div>
              <div className="col-span-1 text-center text-sm" style={{color: loc.scorecard.churn <= 3 ? "#10b981" : loc.scorecard.churn <= 5 ? "#f59e0b" : "#ef4444"}}>{loc.scorecard.churn ? `${loc.scorecard.churn}%` : "—"}</div>
              <div className="col-span-1 text-center text-sm font-medium text-slate-700">{loc.scorecard.revenue ? `$${(loc.scorecard.revenue/1000).toFixed(0)}K` : "—"}</div>
              <div className="col-span-1 text-center">
                {loc.reportStatus === "submitted" ? <Badge variant="success">On time</Badge> :
                 loc.reportStatus === "overdue" ? <Badge variant="danger">Overdue</Badge> :
                 <Badge variant="default">N/A</Badge>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // ─── LOCATION DETAIL ─────────────────────────────────────────────────────
  const LocationDetail = ({ location: loc, onBack }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100"><ChevronLeft size={20} className="text-slate-500" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{loc.name}</h1>
            <StatusBadge status={loc.status} />
          </div>
          <p className="text-sm text-slate-500">{loc.owner} · {loc.region}, {loc.country}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"><Mail size={14} /> Message</button>
          <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"><Edit3 size={14} /> Edit</button>
        </div>
      </div>

      {/* SNAP Report KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Active Members" value={loc.members} subtitle={`Target: ${loc.target}`} accent="#0ea5e9" />
        <StatCard icon={UserPlus} label="New This Week" value={loc.newMembers} accent="#10b981" />
        <StatCard icon={TrendingUp} label="Attendance" value={loc.attendance} subtitle={`${loc.members > 0 ? Math.round(loc.attendance/loc.members*100) : 0}% rate`} accent="#8b5cf6" />
        <StatCard icon={Eye} label="Trials Booked" value={loc.trials} subtitle={`${loc.trialsCompleted} completed`} accent="#f59e0b" />
        <StatCard icon={AlertTriangle} label="MIA 14+ Days" value={loc.mia14} accent="#ef4444" />
        <StatCard icon={Clock} label="Suspensions" value={loc.suspensions} accent="#6366f1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card className="p-5">
          <SectionHeader icon={TrendingUp} title="Member Growth Trend" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loc.weeklyData.map((v, i) => ({week: `W${i+1}`, members: v}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{fontSize: 11}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 11}} stroke="#94a3b8" />
                <Tooltip contentStyle={{borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12}} />
                <Area type="monotone" dataKey="members" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Rocks */}
        <Card className="p-5">
          <SectionHeader icon={Target} title="Quarterly Rocks" subtitle="Q1 2026 priorities" />
          <div className="space-y-4">
            {loc.rocks.map((r, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{r.name}</span>
                  <Badge variant={r.onTrack ? "success" : "danger"}>{r.onTrack ? "On Track" : "Off Track"}</Badge>
                </div>
                <ProgressBar value={r.progress} color={r.onTrack ? "#10b981" : "#ef4444"} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Key Metrics + FDD Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader icon={BarChart3} title="SNAP Report Details" subtitle="Weekly operational metrics" />
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Seats/Workstations", value: loc.seats },
              { label: "Max Classes", value: loc.maxClasses },
              { label: "Centre Capacity", value: loc.capacity },
              { label: "Practical Capacity", value: Math.round(loc.capacity * 0.85) },
              { label: "Capacity Utilized", value: `${loc.members > 0 ? Math.round(loc.members / (loc.capacity * 0.85) * 100) : 0}%` },
              { label: "Cancellations", value: loc.cancellations },
              { label: "Postcards Sent", value: loc.postcards },
              { label: "Conversion Rate", value: loc.trialsCompleted > 0 ? `${Math.round(loc.newMembers / loc.trialsCompleted * 100)}%` : "N/A" },
            ].map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">{m.label}</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader icon={Shield} title="Franchise Agreement" subtitle="FDD & compliance details" />
          <div className="space-y-3">
            {[
              { label: "FDD Signed", value: loc.fddSigned || "Pending" },
              { label: "Open Date", value: loc.openDate || "TBD" },
              { label: "Agreement Status", value: loc.fddSigned ? "Active" : "Pending" },
              { label: "Region", value: `${loc.region}, ${loc.country}` },
              { label: "Franchisee", value: loc.owner },
              { label: "Last SNAP Report", value: loc.lastReport || "None" },
              { label: "Report Status", value: loc.reportStatus },
              { label: "Monthly Royalty", value: loc.scorecard.royalty > 0 ? `$${loc.scorecard.royalty.toLocaleString()}` : "N/A" },
            ].map((d, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{d.label}</span>
                <span className="text-sm font-medium text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // ─── SCORECARD VIEW ──────────────────────────────────────────────────────
  const ScorecardView = () => {
    const scorecardMetrics = [
      { label: "Total Active Members", owner: "Network", goal: 400, actual: totalMembers },
      { label: "New Members (Weekly)", owner: "Network", goal: 25, actual: activeLocations.reduce((s,l) => s + l.newMembers, 0) },
      { label: "Cancellations (Weekly)", owner: "Network", goal: 5, actual: activeLocations.reduce((s,l) => s + l.cancellations, 0), lower: true },
      { label: "Attendance Rate", owner: "Network", goal: 85, actual: Math.round(activeLocations.reduce((s,l) => s + (l.members > 0 ? l.attendance/l.members*100 : 0), 0) / activeLocations.length) },
      { label: "Trial Conversion Rate", owner: "Network", goal: 60, actual: 65 },
      { label: "Average NPS", owner: "Network", goal: 85, actual: avgNps },
      { label: "Churn Rate %", owner: "Network", goal: 3, actual: parseFloat(avgChurn), lower: true },
      { label: "SNAP Reports Submitted", owner: "All Owners", goal: activeLocations.length, actual: activeLocations.filter(l => l.reportStatus === "submitted").length },
      { label: "Revenue (Monthly)", owner: "Network", goal: 160000, actual: totalRevenue, fmt: v => `$${(v/1000).toFixed(0)}K` },
      { label: "Royalties Collected", owner: "Jeff", goal: 11200, actual: totalRoyalty, fmt: v => `$${(v/1000).toFixed(1)}K` },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">EOS Scorecard</h1>
          <p className="text-sm text-slate-500 mt-1">Weekly measurables — review in 5 minutes during Level 10 Meeting</p>
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Measurable</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-1 text-center">Goal</div>
            <div className="col-span-1 text-center">Actual</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-3">Progress</div>
          </div>
          {scorecardMetrics.map((m, i) => {
            const fmt = m.fmt || (v => v);
            const onTrack = m.lower ? m.actual <= m.goal : m.actual >= m.goal;
            const pct = m.lower ? (m.actual <= m.goal ? 100 : Math.max(0, 100 - ((m.actual - m.goal) / m.goal * 100))) : Math.min(100, Math.round(m.actual / m.goal * 100));
            return (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <div className="col-span-4 text-sm font-medium text-slate-800">{m.label}</div>
                <div className="col-span-2 text-sm text-slate-500">{m.owner}</div>
                <div className="col-span-1 text-center text-sm text-slate-600">{fmt(m.goal)}</div>
                <div className="col-span-1 text-center text-sm font-bold" style={{color: onTrack ? "#10b981" : "#ef4444"}}>{fmt(m.actual)}</div>
                <div className="col-span-1 text-center">
                  {onTrack ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <AlertCircle size={18} className="text-red-500 mx-auto" />}
                </div>
                <div className="col-span-3"><ProgressBar value={pct} color={onTrack ? "#10b981" : "#ef4444"} /></div>
              </div>
            );
          })}
        </Card>

        {/* Per-Location Breakdown */}
        <Card className="p-5">
          <SectionHeader icon={Store} title="Location Scorecard Comparison" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeLocations.map(l => ({name: l.name.split(" ")[0], members: l.members, target: l.target, nps: l.scorecard.nps}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 11}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 11}} stroke="#94a3b8" />
                <Tooltip contentStyle={{borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12}} />
                <Legend />
                <Bar dataKey="members" fill="#0ea5e9" radius={[4,4,0,0]} name="Members" />
                <Bar dataKey="target" fill="#e2e8f0" radius={[4,4,0,0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  };

  // ─── ROCKS & GOALS VIEW ──────────────────────────────────────────────────
  const RocksView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rocks & Goals</h1>
        <p className="text-sm text-slate-500 mt-1">EOS quarterly priorities — broken down from annual vision</p>
      </div>

      {/* Quarterly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {QUARTERLY_GOALS.map((q, i) => (
          <Card key={i} className={`p-5 ${q.status === "active" ? "ring-2 ring-sky-300 border-sky-200" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-slate-900">{q.q} 2026</span>
              <Badge variant={q.status === "complete" ? "success" : q.status === "active" ? "info" : "default"}>{q.status}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Revenue Goal</span><span className="font-medium">${(q.revenue/1000).toFixed(0)}K</span></div>
              <div className="flex justify-between"><span className="text-slate-500">New Locations</span><span className="font-medium">{q.newLocations}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Member Target</span><span className="font-medium">{q.members}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {/* All Rocks by Location */}
      <Card className="p-5">
        <SectionHeader icon={Target} title="All Location Rocks — Q1 2026" subtitle="5-minute review: On Track or Off Track" />
        <div className="space-y-6">
          {LOCATIONS.filter(l => l.rocks.length > 0).map(loc => (
            <div key={loc.id}>
              <div className="flex items-center gap-2 mb-3">
                <HealthDot score={loc.healthScore} />
                <h4 className="text-sm font-semibold text-slate-900">{loc.name}</h4>
                <span className="text-xs text-slate-400">— {loc.owner}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-5">
                {loc.rocks.map((r, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${r.onTrack ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
                    <div className="text-sm font-medium text-slate-800 mb-2">{r.name}</div>
                    <ProgressBar value={r.progress} color={r.onTrack ? "#10b981" : "#ef4444"} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── LEVEL 10 MEETING VIEW ───────────────────────────────────────────────
  const L10View = () => {
    const sections = [
      { id: "segue", label: "Segue", time: "5 min", icon: Users },
      { id: "scorecard", label: "Scorecard", time: "5 min", icon: BarChart3 },
      { id: "rocks", label: "Rock Review", time: "5 min", icon: Target },
      { id: "headlines", label: "Headlines", time: "5 min", icon: Megaphone },
      { id: "todos", label: "To-Do List", time: "5 min", icon: CheckCircle2 },
      { id: "ids", label: "IDS (Issues)", time: "60 min", icon: AlertCircle },
      { id: "conclude", label: "Conclude", time: "5 min", icon: Star },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Level 10 Meeting</h1>
            <p className="text-sm text-slate-500 mt-1">Weekly L10 — 90 minutes that transform your franchise network</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 flex items-center gap-2">
              <Calendar size={14} /> Start Meeting
            </button>
          </div>
        </div>

        {/* Meeting Agenda Tabs */}
        <Card className="p-3">
          <div className="flex gap-1 overflow-x-auto">
            {sections.map(s => (
              <button key={s.id} onClick={() => setMeetingSection(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  meetingSection === s.id ? "bg-sky-100 text-sky-700" : "text-slate-500 hover:bg-slate-50"}`}>
                <s.icon size={14} />
                {s.label}
                <span className="text-slate-400 text-[10px]">{s.time}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Section Content */}
        {meetingSection === "segue" && (
          <Card className="p-6">
            <SectionHeader icon={Users} title="Segue — Personal & Professional Best" subtitle="5 minutes · Each person shares one personal and one professional win" />
            <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
              <p className="text-sm text-sky-800">Start the meeting by going around the room. Each person shares their best personal and best professional moment from the past week. This builds connection and keeps the team human.</p>
            </div>
          </Card>
        )}

        {meetingSection === "scorecard" && (
          <Card className="p-6">
            <SectionHeader icon={BarChart3} title="Scorecard Review" subtitle="5 minutes · On Track or Off Track — no explanations, drop to Issues" />
            <div className="space-y-2 mt-4">
              {[
                { metric: "Total Network Members", goal: 400, actual: totalMembers },
                { metric: "New Members This Week", goal: 25, actual: activeLocations.reduce((s,l)=>s+l.newMembers,0) },
                { metric: "Cancellations", goal: 5, actual: activeLocations.reduce((s,l)=>s+l.cancellations,0), lower: true },
                { metric: "Avg Attendance Rate", goal: 85, actual: Math.round(activeLocations.reduce((s,l) => s + (l.members > 0 ? l.attendance/l.members*100 : 0), 0) / activeLocations.length) },
                { metric: "SNAP Reports On Time", goal: activeLocations.length, actual: activeLocations.filter(l=>l.reportStatus==="submitted").length },
                { metric: "Network NPS", goal: 85, actual: avgNps },
              ].map((m, i) => {
                const onTrack = m.lower ? m.actual <= m.goal : m.actual >= m.goal;
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${onTrack ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                    <span className="text-sm font-medium text-slate-800">{m.metric}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">Goal: {m.goal}</span>
                      <span className={`text-sm font-bold ${onTrack ? "text-emerald-700" : "text-red-700"}`}>{m.actual}</span>
                      {onTrack ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {meetingSection === "rocks" && (
          <Card className="p-6">
            <SectionHeader icon={Target} title="Rock Review" subtitle="5 minutes · On Track or Off Track for each Rock" />
            <div className="space-y-4 mt-4">
              {LOCATIONS.filter(l => l.rocks.length > 0).map(loc => (
                <div key={loc.id}>
                  <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><HealthDot score={loc.healthScore} />{loc.name}</div>
                  {loc.rocks.map((r, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 ml-5 mb-1 rounded border ${r.onTrack ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"}`}>
                      <span className="text-sm text-slate-700">{r.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium">{r.progress}%</span>
                        <Badge variant={r.onTrack ? "success" : "danger"}>{r.onTrack ? "On Track" : "Off Track"}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        )}

        {meetingSection === "headlines" && (
          <Card className="p-6">
            <SectionHeader icon={Megaphone} title="Headlines" subtitle="5 minutes · Good or bad news about customers, employees, or the network" />
            <div className="space-y-2 mt-4">
              {HEADLINES.map(h => (
                <div key={h.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  h.type === "win" ? "bg-emerald-50 border-emerald-100" : h.type === "concern" ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                  {h.type === "win" ? <Award size={16} className="text-emerald-600 mt-0.5" /> : h.type === "concern" ? <AlertTriangle size={16} className="text-red-500 mt-0.5" /> : <BookOpen size={16} className="text-slate-500 mt-0.5" />}
                  <span className="text-sm text-slate-800">{h.text}</span>
                </div>
              ))}
              <button className="w-full p-3 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add Headline
              </button>
            </div>
          </Card>
        )}

        {meetingSection === "todos" && (
          <Card className="p-6">
            <SectionHeader icon={CheckCircle2} title="To-Do List" subtitle="5 minutes · 7-day action items — Done or Not Done" />
            <div className="space-y-2 mt-4">
              {TODOS.map(t => (
                <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border ${t.done ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-200"}`}>
                  <button className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                    {t.done && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm ${t.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{t.text}</span>
                    <div className="text-xs text-slate-400 mt-0.5">Owner: {t.owner} · Due: {t.due}</div>
                  </div>
                  <Badge variant={t.done ? "success" : "warning"}>{t.done ? "Done" : "Not Done"}</Badge>
                </div>
              ))}
              <button className="w-full p-3 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add To-Do
              </button>
            </div>
          </Card>
        )}

        {meetingSection === "ids" && (
          <Card className="p-6">
            <SectionHeader icon={AlertCircle} title="IDS — Identify, Discuss, Solve" subtitle="60 minutes · The heart of the meeting — solve real issues" />
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-4">
              <p className="text-sm text-amber-800">Prioritize the top 3 issues. For each: <strong>Identify</strong> the root cause, <strong>Discuss</strong> solutions, <strong>Solve</strong> by assigning a To-Do with owner and deadline.</p>
            </div>
            <div className="space-y-2">
              {ISSUES_LIST.map((issue, i) => (
                <div key={issue.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{issue.title}</div>
                    <div className="text-xs text-slate-400">Owner: {issue.owner} · Created: {issue.created}</div>
                  </div>
                  <Badge variant={issue.priority === "high" ? "danger" : issue.priority === "medium" ? "warning" : "default"}>{issue.priority}</Badge>
                  <Badge variant={issue.status === "open" ? "info" : "purple"}>{issue.status}</Badge>
                </div>
              ))}
              <button className="w-full p-3 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add Issue
              </button>
            </div>
          </Card>
        )}

        {meetingSection === "conclude" && (
          <Card className="p-6">
            <SectionHeader icon={Star} title="Conclude" subtitle="5 minutes · Recap, cascading messages, and rate the meeting" />
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Recap To-Dos Created This Meeting</h4>
                <p className="text-sm text-slate-500">Review all new To-Dos assigned during IDS. Confirm owner and 7-day deadline for each.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Cascading Messages</h4>
                <p className="text-sm text-slate-500">What needs to be communicated to the wider team or franchise network?</p>
              </div>
              <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                <h4 className="text-sm font-semibold text-sky-700 mb-3">Rate This Meeting (1-10)</h4>
                <div className="flex gap-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} className="w-9 h-9 rounded-lg border-2 border-sky-200 text-sm font-bold text-sky-600 hover:bg-sky-100 hover:border-sky-400 transition-all">{n}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ─── COMMUNICATIONS VIEW ─────────────────────────────────────────────────
  const CommunicationsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Communications Hub</h1>
        <p className="text-sm text-slate-500 mt-1">Stay connected with franchisees — the #1 predictor of franchise success</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader icon={MessageSquare} title="Recent Messages" subtitle={`${unreadMessages} unread`} action={
            <button className="text-sm text-sky-600 font-medium hover:text-sky-700 flex items-center gap-1"><Send size={14} /> New Message</button>
          } />
          <div className="space-y-2">
            {MESSAGES.map(m => (
              <div key={m.id} className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${m.unread ? "bg-sky-50/50 border-sky-200" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xs font-bold">{m.from.split(" ").map(n=>n[0]).join("")}</div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{m.from}</span>
                      <span className="text-xs text-slate-400 ml-2">{m.location}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{m.time}</span>
                </div>
                <p className="text-sm text-slate-600 ml-10 line-clamp-2">{m.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <SectionHeader icon={Calendar} title="Scheduled Calls" subtitle="Upcoming 1:1s and group calls" />
            <div className="space-y-2">
              {[
                { who: "Sarah Williams — Melbourne South", when: "Mon Mar 3, 10:00 AM", type: "1:1 Call" },
                { who: "Network-Wide Town Hall", when: "Wed Mar 5, 2:00 PM", type: "Group Call" },
                { who: "Tom Rivera — Adelaide Hills", when: "Thu Mar 6, 11:00 AM", type: "Onboarding Check" },
                { who: "Ahmed Hassan — Cairo East", when: "Fri Mar 7, 9:00 AM", type: "Discovery Call" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                  <div className="w-2 h-8 rounded-full" style={{background: CHART_COLORS[i]}} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{c.who}</div>
                    <div className="text-xs text-slate-500">{c.when}</div>
                  </div>
                  <Badge variant="info">{c.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionHeader icon={Megaphone} title="Network Announcements" subtitle="Broadcast to all locations" />
            <button className="w-full p-4 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Create Announcement
            </button>
          </Card>
        </div>
      </div>
    </div>
  );

  // ─── COMPLIANCE VIEW ─────────────────────────────────────────────────────
  const ComplianceView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">FDD & Compliance</h1>
        <p className="text-sm text-slate-500 mt-1">Franchise agreement tracking, FDD signing dates, renewals, and compliance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Active Agreements" value={LOCATIONS.filter(l => l.fddSigned).length} accent="#10b981" />
        <StatCard icon={Clock} label="Pending FDD" value={LOCATIONS.filter(l => !l.fddSigned).length} accent="#f59e0b" />
        <StatCard icon={Shield} label="Compliance Rate" value="92%" accent="#0ea5e9" />
        <StatCard icon={Calendar} label="Next Renewal" value="Jun 2026" accent="#8b5cf6" />
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-8 gap-4 px-5 py-3 bg-slate-50 border-b text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="col-span-2">Location</div>
          <div>Owner</div>
          <div>FDD Signed</div>
          <div>Open Date</div>
          <div>Agreement Status</div>
          <div>Region</div>
          <div>Actions</div>
        </div>
        {LOCATIONS.map(loc => (
          <div key={loc.id} className="grid grid-cols-8 gap-4 px-5 py-3 items-center border-b border-slate-100 hover:bg-slate-50">
            <div className="col-span-2 text-sm font-medium text-slate-900">{loc.name}</div>
            <div className="text-sm text-slate-600">{loc.owner}</div>
            <div className="text-sm">{loc.fddSigned ? <Badge variant="success">{loc.fddSigned}</Badge> : <Badge variant="warning">Pending</Badge>}</div>
            <div className="text-sm text-slate-600">{loc.openDate || "TBD"}</div>
            <div><StatusBadge status={loc.status} /></div>
            <div className="text-sm text-slate-600">{loc.region}, {loc.country}</div>
            <div className="flex gap-1">
              <button className="p-1.5 rounded hover:bg-slate-100"><Eye size={14} className="text-slate-400" /></button>
              <button className="p-1.5 rounded hover:bg-slate-100"><Edit3 size={14} className="text-slate-400" /></button>
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-5">
        <SectionHeader icon={Calendar} title="Key Dates & Renewals" subtitle="Upcoming compliance milestones" />
        <div className="space-y-2">
          {[
            { date: "2026-03-15", event: "Sydney CBD — 3-year anniversary review", type: "Review" },
            { date: "2026-04-01", event: "Adelaide Hills — Target open date", type: "Opening" },
            { date: "2026-06-10", event: "Brisbane North — FDD renewal", type: "Renewal" },
            { date: "2026-09-15", event: "Insurance renewals — all Australian locations", type: "Insurance" },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200">
              <div className="text-center">
                <div className="text-xs text-slate-400">{new Date(d.date).toLocaleDateString('en-US', {month: 'short'})}</div>
                <div className="text-lg font-bold text-slate-900">{new Date(d.date).getDate()}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{d.event}</div>
              </div>
              <Badge variant="info">{d.type}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── REPORTS VIEW ────────────────────────────────────────────────────────
  const ReportsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Network performance reporting and data exports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader icon={PieChartIcon} title="Revenue by Location" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activeLocations.map((l, i) => ({name: l.name, value: l.scorecard.revenue, fill: CHART_COLORS[i]}))}
                  cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} dataKey="value">
                  {activeLocations.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${(v/1000).toFixed(0)}K`} contentStyle={{borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12}} />
                <Legend iconType="circle" formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={BarChart3} title="NPS Comparison" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeLocations.map(l => ({name: l.name.split(" ")[0], nps: l.scorecard.nps}))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{fontSize: 11}} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" tick={{fontSize: 11}} stroke="#94a3b8" width={80} />
                <Tooltip contentStyle={{borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12}} />
                <Bar dataKey="nps" radius={[0,4,4,0]}>
                  {activeLocations.map((l, i) => <Cell key={i} fill={l.scorecard.nps >= 80 ? "#10b981" : l.scorecard.nps >= 70 ? "#f59e0b" : "#ef4444"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionHeader icon={FileText} title="Available Reports" subtitle="Generate and export" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Weekly SNAP Summary", desc: "All location KPIs consolidated" },
              { name: "Monthly P&L by Location", desc: "Revenue, royalty, expenses" },
              { name: "Quarterly Rock Report", desc: "Progress across all rocks" },
              { name: "FDD Compliance Report", desc: "Agreement status & renewals" },
              { name: "Churn Analysis", desc: "Cancellation trends & risk" },
              { name: "Trial Conversion Funnel", desc: "Lead-to-member pipeline" },
              { name: "L10 Meeting History", desc: "Past meetings, issues, todos" },
              { name: "Franchisee Scorecard", desc: "Individual performance cards" },
            ].map((r, i) => (
              <button key={i} className="p-4 rounded-lg border border-slate-200 text-left hover:bg-slate-50 hover:border-sky-200 transition-all">
                <FileText size={18} className="text-sky-500 mb-2" />
                <div className="text-sm font-medium text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500 mt-1">{r.desc}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // ─── ADD LOCATION MODAL ──────────────────────────────────────────────────
  const AddLocationModal = () => (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowAddLocation(false)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Add New Location</h2>
          <button onClick={() => setShowAddLocation(false)} className="p-1 rounded hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Location Name", placeholder: "e.g. Sydney CBD" },
            { label: "Franchisee / Owner Name", placeholder: "e.g. Marcus Chen" },
            { label: "Email Address", placeholder: "owner@email.com" },
            { label: "Region / State", placeholder: "e.g. NSW" },
            { label: "Country", placeholder: "e.g. Australia" },
          ].map((f, i) => (
            <div key={i}>
              <label className="text-sm font-medium text-slate-700 mb-1 block">{f.label}</label>
              <input placeholder={f.placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">FDD Signing Date</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Target Open Date</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300">
              <option>Prospect</option>
              <option>Onboarding</option>
              <option>Active</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Number of Seats/Workstations</label>
            <input type="number" placeholder="13" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={() => setShowAddLocation(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">Create Location</button>
        </div>
      </div>
    </div>
  );

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────
  const views = {
    dashboard: DashboardView,
    locations: LocationsView,
    scorecard: ScorecardView,
    rocks: RocksView,
    l10: L10View,
    communications: CommunicationsView,
    compliance: ComplianceView,
    reports: ReportsView,
  };
  const ActiveView = views[activeNav] || DashboardView;

  return (
    <div className="min-h-screen bg-slate-50" style={{fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"}}>
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-60"}`}>
        <TopBar />
        <div className="p-6 max-w-[1400px] mx-auto">
          <ActiveView />
        </div>
      </div>
      {showAddLocation && <AddLocationModal />}
    </div>
  );
}
