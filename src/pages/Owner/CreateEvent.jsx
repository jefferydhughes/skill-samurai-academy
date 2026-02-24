import { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Users, DollarSign, Settings, FileText, Save, Eye } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [form, setForm] = useState({
    // Basic Info
    eventType: 'class',
    name: '',
    description: '',
    imageUrl: '',
    
    // Schedule
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [],
    
    // Registration
    registrationOpen: '',
    registrationClose: '',
    capacity: 20,
    lowCapacityThreshold: 5,
    
    // Tuition
    tuitionType: 'membership',
    membershipPrice: '',
    campPrice: '',
    
    // Extra Services
    earlyDropOffAvailable: false,
    earlyDropOffPrice: '',
    earlyDropOffTime: '',
    latePickUpAvailable: false,
    latePickUpPrice: '',
    latePickUpTime: '',
    
    // Restrictions
    genderRestriction: 'any',
    minAge: '',
    maxAge: '',
    minGrade: '',
    maxGrade: '',
    
    // Waivers
    mediaWaiverRequired: true,
    healthNeedsRequired: true,
    customWaiverText: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      handleChange('imageUrl', file_url);
    } catch (error) {
      alert('Failed to upload image');
    }
  };

  const handleSaveAndPublish = async (publish = false) => {
    if (!form.name || !form.startDate || !form.capacity) {
      alert('Please fill in all required fields (Name, Start Date, Capacity)');
      return;
    }

    try {
      if (form.eventType === 'camp') {
        // Create Camp Event with proper datetime formatting
        const startDateTime = `${form.startDate}T${form.startTime || '09:00'}:00`;
        const endDateTime = `${form.endDate || form.startDate}T${form.endTime || '17:00'}:00`;
        
        await api.entities.CampEvent.create({
          location_id: 'default',
          title: form.name,
          description: form.description,
          thumbnail: form.imageUrl,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          capacity: parseInt(form.capacity),
          price: Math.round(parseFloat(form.campPrice || 0) * 100),
          age_min: form.minAge ? parseInt(form.minAge) : 5,
          age_max: form.maxAge ? parseInt(form.maxAge) : 18,
          active: publish
        });
      } else {
        // Create Program and Class Session
        const program = await api.entities.Program.create({
          name: form.name,
          age_min: form.minAge ? parseInt(form.minAge) : 5,
          age_max: form.maxAge ? parseInt(form.maxAge) : 18,
          type: 'weekly',
          active: publish
        });

        await api.entities.ClassSession.create({
          programId: program.id,
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate || form.startDate,
          schedule: {
            days: form.daysOfWeek,
            startTime: form.startTime,
            endTime: form.endTime,
            duration: 60
          },
          capacity: parseInt(form.capacity),
          enrolledCount: 0,
          location: 'TBD',
          status: publish ? 'scheduled' : 'draft'
        });
      }

      alert(publish ? 'Event published successfully!' : 'Event saved as draft!');
      navigate('/ProgramsManager');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'registration', label: 'Registration', icon: Users },
    { id: 'tuition', label: 'Tuition', icon: DollarSign },
    { id: 'extras', label: 'Extra Services', icon: Clock },
    { id: 'restrictions', label: 'Restrictions', icon: Settings },
    { id: 'waivers', label: 'Waivers', icon: FileText },
  ];

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Event</h1>
          <p className="text-slate-600">Set up a new class or camp program</p>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                {/* Basic Info */}
                {activeSection === 'basic' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Basic Information</h2>
                    </div>

                    <div className="space-y-2">
                      <Label>Event Type *</Label>
                      <Select value={form.eventType} onValueChange={(val) => handleChange('eventType', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class">Class</SelectItem>
                          <SelectItem value="camp">Camp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Program Name *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Summer Coding Bootcamp"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Program Description</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe what students will learn..."
                        rows={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Program Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                      />
                      {form.imageUrl && (
                        <img src={form.imageUrl} alt="Preview" className="mt-2 w-48 h-32 object-cover rounded-lg" />
                      )}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {activeSection === 'schedule' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Schedule</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => handleChange('startDate', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => handleChange('endDate', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={form.startTime}
                          onChange={(e) => handleChange('startTime', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={form.endTime}
                          onChange={(e) => handleChange('endTime', e.target.value)}
                        />
                      </div>
                    </div>

                    {form.eventType === 'class' && (
                      <div className="space-y-2">
                        <Label>Days of Week</Label>
                        <div className="flex flex-wrap gap-2">
                          {dayOptions.map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                form.daysOfWeek.includes(day)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Registration */}
                {activeSection === 'registration' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Registration Period</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Registration Opens</Label>
                        <Input
                          type="date"
                          value={form.registrationOpen}
                          onChange={(e) => handleChange('registrationOpen', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Registration Closes</Label>
                        <Input
                          type="date"
                          value={form.registrationClose}
                          onChange={(e) => handleChange('registrationClose', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Event Capacity *</Label>
                      <Input
                        type="number"
                        value={form.capacity}
                        onChange={(e) => handleChange('capacity', e.target.value)}
                        placeholder="Maximum number of participants"
                      />
                      <p className="text-xs text-slate-500">Users will see remaining spots when capacity is low</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Show Remaining Capacity Alert When Below</Label>
                      <Input
                        type="number"
                        value={form.lowCapacityThreshold || 5}
                        onChange={(e) => handleChange('lowCapacityThreshold', e.target.value)}
                        placeholder="5"
                      />
                      <p className="text-xs text-slate-500">Display "X spots left" alert when remaining capacity falls below this number</p>
                    </div>
                  </div>
                )}

                {/* Tuition */}
                {activeSection === 'tuition' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Tuition Options</h2>
                    </div>

                    <div className="space-y-2">
                      <Label>Tuition Type</Label>
                      <Select value={form.tuitionType} onValueChange={(val) => handleChange('tuitionType', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="membership">Membership</SelectItem>
                          <SelectItem value="camp">Camp Tuition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.tuitionType === 'membership' && (
                      <div className="space-y-2">
                        <Label>Membership Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={form.membershipPrice}
                          onChange={(e) => handleChange('membershipPrice', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    {form.tuitionType === 'camp' && (
                      <div className="space-y-2">
                        <Label>Camp Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={form.campPrice}
                          onChange={(e) => handleChange('campPrice', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Extra Services */}
                {activeSection === 'extras' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Extra Services</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <Label>Early Drop-Off</Label>
                          <p className="text-sm text-slate-600">Allow students to arrive early</p>
                        </div>
                        <Switch
                          checked={form.earlyDropOffAvailable}
                          onCheckedChange={(val) => handleChange('earlyDropOffAvailable', val)}
                        />
                      </div>

                      {form.earlyDropOffAvailable && (
                        <div className="ml-4 grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Early Drop-Off Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={form.earlyDropOffPrice}
                              onChange={(e) => handleChange('earlyDropOffPrice', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Drop-Off Time</Label>
                            <Input
                              type="time"
                              value={form.earlyDropOffTime}
                              onChange={(e) => handleChange('earlyDropOffTime', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <Label>Late Pick-Up</Label>
                          <p className="text-sm text-slate-600">Allow students to stay late</p>
                        </div>
                        <Switch
                          checked={form.latePickUpAvailable}
                          onCheckedChange={(val) => handleChange('latePickUpAvailable', val)}
                        />
                      </div>

                      {form.latePickUpAvailable && (
                        <div className="ml-4 grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Late Pick-Up Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={form.latePickUpPrice}
                              onChange={(e) => handleChange('latePickUpPrice', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Pick-Up Time</Label>
                            <Input
                              type="time"
                              value={form.latePickUpTime}
                              onChange={(e) => handleChange('latePickUpTime', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Restrictions */}
                {activeSection === 'restrictions' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Participant Restrictions</h2>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender Restriction</Label>
                      <Select value={form.genderRestriction} onValueChange={(val) => handleChange('genderRestriction', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Gender</SelectItem>
                          <SelectItem value="male">Male Only</SelectItem>
                          <SelectItem value="female">Female Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Minimum Age</Label>
                        <Input
                          type="number"
                          value={form.minAge}
                          onChange={(e) => handleChange('minAge', e.target.value)}
                          placeholder="e.g., 7"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Maximum Age</Label>
                        <Input
                          type="number"
                          value={form.maxAge}
                          onChange={(e) => handleChange('maxAge', e.target.value)}
                          placeholder="e.g., 12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Minimum Grade</Label>
                        <Input
                          value={form.minGrade}
                          onChange={(e) => handleChange('minGrade', e.target.value)}
                          placeholder="e.g., 3rd"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Maximum Grade</Label>
                        <Input
                          value={form.maxGrade}
                          onChange={(e) => handleChange('maxGrade', e.target.value)}
                          placeholder="e.g., 6th"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Waivers */}
                {activeSection === 'waivers' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Waivers & Health</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <Label>Media Waiver</Label>
                          <p className="text-sm text-slate-600">Require parents to sign media consent</p>
                        </div>
                        <Switch
                          checked={form.mediaWaiverRequired}
                          onCheckedChange={(val) => handleChange('mediaWaiverRequired', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <Label>Health Needs</Label>
                          <p className="text-sm text-slate-600">Ask about health conditions and allergies</p>
                        </div>
                        <Switch
                          checked={form.healthNeedsRequired}
                          onCheckedChange={(val) => handleChange('healthNeedsRequired', val)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Custom Waiver Text</Label>
                        <Textarea
                          value={form.customWaiverText}
                          onChange={(e) => handleChange('customWaiverText', e.target.value)}
                          placeholder="Add any additional waiver or liability text..."
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-8 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex > 0) {
                        setActiveSection(sections[currentIndex - 1].id);
                      }
                    }}
                    disabled={activeSection === 'basic'}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    {activeSection === 'waivers' ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleSaveAndPublish(false)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                          onClick={() => handleSaveAndPublish(true)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Publish
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          const currentIndex = sections.findIndex(s => s.id === activeSection);
                          if (currentIndex < sections.length - 1) {
                            setActiveSection(sections[currentIndex + 1].id);
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}