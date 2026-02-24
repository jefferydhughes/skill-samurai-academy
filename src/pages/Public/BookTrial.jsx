import { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { MapPin, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import BookingWizard from '@/components/booking/BookingWizard';

export default function BookFreeSession() {
  const [sessions, setSessions] = useState([]);
  const [academy, setAcademy] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dayOffset, setDayOffset] = useState(1);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [program, setProgram] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    loadWeeklySlots();
    loadProgram();
  }, []);

  async function loadProgram() {
    const urlParams = new URLSearchParams(window.location.search);
    const programId = urlParams.get('programId');
    if (programId) {
      const programs = await api.entities.Program.list();
      const prog = programs.find(p => p.id === programId);
      setProgram(prog);
    }
  }

  async function loadWeeklySlots() {
    setLoading(true);

    try {
      // Get location from URL params (e.g., ?slug=moncton)
      const urlParams = new URLSearchParams(window.location.search);
      const locationSlug = urlParams.get('slug') || urlParams.get('location');

      let locationId = null;
      if (locationSlug) {
        // Find location by slug
        const locations = await api.entities.Location.filter({ slug: locationSlug, is_active: true });
        if (locations.length > 0) {
          setAcademy(locations[0]);
          locationId = locations[0].id;
        }
      }

      // Load weekly slots for this location
      const slots = locationId
        ? await api.entities.WeeklyClassSlot.filter({ location_id: locationId, active: true })
        : await api.entities.WeeklyClassSlot.filter({ active: true });

      setSessions(slots);
    } catch (error) {
      console.error('Error loading weekly slots:', error);
    }

    setLoading(false);
  }

  const handleSelectSlot = (slot) => {
    setSelectedSession(slot);
    setWizardOpen(true);
  };

  // Group slots by weekday
  const groupedSlots = sessions.reduce((acc, slot) => {
    const day = slot.weekday;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src="https://res2.weblium.site/res/625d58fa02e0480022e0f211/680a36d8ef8bd06783b6ebe5_optimized"
          alt="Weekly Classes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80"></div>
      </div>

      {/* Location Header */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-3">
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-900">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold">{academy?.name || 'Weekly Classes'}</span>
              {academy?.city && (
                <span className="text-slate-500 truncate max-w-[140px]">
                  {academy.city}, {academy.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="px-4 pb-10 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-600">Loading class times...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No weekly classes available at this location yet.</p>
          </div>
        ) : (
          Object.keys(groupedSlots).sort().map(dayNum => {
            const daySlots = groupedSlots[dayNum];
            const dayName = weekdays[dayNum];

            return (
              <div key={dayNum} className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl">
                <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{dayName}</h3>
                    <p className="text-xs text-slate-500">{daySlots.length} class{daySlots.length !== 1 ? 'es' : ''} available</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedDay(expandedDay === dayNum ? null : dayNum)}
                      className="rounded-xl"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      Info
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSelectSlot(daySlots[0])}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>

                {expandedDay === dayNum && (
                  <div className="px-4 pb-4 space-y-3">
                    {daySlots.map(slot => (
                      <div key={slot.id} className="border rounded-xl p-4 bg-white/80">
                        <div className="font-bold text-slate-900">{slot.title}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          {slot.start_time} · {slot.duration_minutes} minutes
                        </div>
                        <div className="text-sm text-slate-500">
                          Ages {slot.age_min}-{slot.age_max} · Capacity: {slot.capacity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BookingWizard
        isOpen={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setSelectedSession(null);
        }}
        offering={program}
        session={selectedSession}
        bookingType="trial"
      />
    </div>
  );
}





function RegistrationForm({ session, academy, onBack, onSuccess }) {
  const [form, setForm] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const sessionDate = new Date(session.startDate);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const trialDate = new Date(session.startDate);
      
      // Create trial booking record
      await api.entities.TrialBooking.create({
        location_id: session.academyId,
        parent_name: form.parentName,
        parent_email: form.email,
        parent_phone: form.phone || '',
        student_name: form.childName,
        student_age: parseInt(form.childAge),
        trial_datetime: session.startDate,
        trial_type: 'in_person',
        pipeline_stage: 'confirmed',
        confirmation_sent: true,
        source: 'website'
      });

      // Update session enrollment count
      await api.entities.ClassSession.update(session.id, {
        enrolledCount: (session.enrolledCount || 0) + 1
      });

      // Send confirmation email with detailed information
      await api.integrations.Core.SendEmail({
        to: form.email,
        from_name: 'Skill Samurai',
        subject: '🎉 Your Free Trial Session is Confirmed!',
        body: `Hi ${form.parentName},

Great news! Your free trial session for ${form.childName} has been confirmed!

📅 Date: ${trialDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
🕐 Time: ${trialDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
🏫 Location: ${academy?.name || 'Skill Samurai'} ${academy?.address ? '- ' + academy.address : ''}

What to Expect:
• Your child will learn basic coding concepts in a fun, interactive environment
• Our instructors will guide them through age-appropriate projects
• Duration: ${session.schedule?.duration || 60} minutes
• No prior experience needed!

What to Bring:
• A curious mind and excitement to learn!
• Water bottle (optional)

You'll receive a reminder 24 hours before the session.

Questions? Reply to this email or call us.

We're excited to meet ${form.childName}!

- The Skill Samurai Team`
      });

      alert('🎉 Session booked! Check your email for confirmation.');
      onSuccess();
      onBack();
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl p-6 md:p-8">
          <button onClick={onBack} className="text-sm mb-6 text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-semibold">
            ← Change time
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              {format(sessionDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <p className="text-lg text-slate-600">
              {format(sessionDate, 'h:mm a')}
            </p>
          </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Parent Name *
            </label>
            <input
              required
              value={form.parentName}
              onChange={e => setForm({ ...form, parentName: e.target.value })}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email *
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Child's Name *
            </label>
            <input
              required
              value={form.childName}
              onChange={e => setForm({ ...form, childName: e.target.value })}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              placeholder="Child's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Child's Age *
            </label>
            <input
              required
              type="number"
              value={form.childAge}
              onChange={e => setForm({ ...form, childAge: e.target.value })}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              placeholder="Age"
              min="5"
              max="18"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Booking...' : 'BOOK FREE SESSION'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}