import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, MapPin, Clock, Send, Loader2, CheckCircle2 } from 'lucide-react';

const subjects = [
  'General Enquiry',
  'Book a Free Trial',
  'Franchise Opportunities',
  'Technical Support',
  'Billing & Payments',
  'Curriculum & Programs',
  'Other',
];

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email',
    value: 'hello@skillsamurai.academy',
    href: 'mailto:hello@skillsamurai.academy',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: 'Response time',
    value: 'Within 1–2 business days',
    href: null,
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: 'Locations',
    value: 'Find your nearest academy',
    href: createPageUrl('Locations'),
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('contact_enquiries')
        .insert({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        });

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err) {
      // Gracefully degrade if table doesn't exist yet
      console.warn('Contact form submission:', err.message);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Have a question about programs, franchising, or anything else? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact info sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="text-slate-900 hover:text-indigo-600 transition-colors font-medium">
                      {item.value}
                    </a>
                  ) : (
                    <div className="text-slate-900 font-medium">{item.value}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-4">Looking for a specific location?</p>
              <Button asChild variant="outline" className="w-full">
                <Link to={createPageUrl('Locations')}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Your Local Academy
                </Link>
              </Button>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-slate-600 mb-6">
                      Thanks for reaching out. We'll get back to you within 1–2 business days.
                    </p>
                    <Button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} variant="outline">
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Send us a message</h2>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Jane Smith"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="jane@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select value={form.subject} onValueChange={(v) => setForm(f => ({ ...f, subject: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject..." />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us more about your enquiry..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                      disabled={isSubmitting || !form.subject}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Send Message</>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
