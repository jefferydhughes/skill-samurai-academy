import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Sparkles, Mail, BookOpen, CheckCircle } from 'lucide-react';
import { addDays, format } from 'date-fns';

export default function OnboardingWizard({ open, onClose, instructor }) {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const startOnboarding = async () => {
    setGenerating(true);
    
    try {
      // Generate personalized welcome email using AI
      const emailContent = await api.integrations.Core.InvokeLLM({
        prompt: `Generate a warm, professional welcome email for a new ${instructor.role} at Skill Samurai coding academy. 
        
Instructor details:
- Name: ${instructor.full_name}
- Email: ${instructor.email}
- Role: ${instructor.role}

The email should:
- Welcome them to the team
- Express excitement about their joining
- Mention they'll receive training materials and tasks
- Include a brief overview of what to expect in their first week
- Be encouraging and friendly
- End with "The Skill Samurai Team"

Keep it concise (200-250 words) and professional yet warm.`,
      });

      // Send welcome email
      await api.integrations.Core.SendEmail({
        to: instructor.email,
        from_name: 'Skill Samurai Team',
        subject: `Welcome to Skill Samurai, ${instructor.full_name.split(' ')[0]}! 🎉`,
        body: emailContent,
      });

      // Generate role-based training modules and tasks
      const trainingModules = instructor.role === 'admin' 
        ? [
            {
              id: 'admin-1',
              title: 'Platform Administration',
              description: 'Learn how to manage programs, schedules, and student enrollments',
              status: 'not_started',
              due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
              resources: ['Admin Dashboard Guide', 'Program Management Tutorial']
            },
            {
              id: 'admin-2',
              title: 'Instructor Management',
              description: 'Managing instructors, assignments, and performance tracking',
              status: 'not_started',
              due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
              resources: ['Instructor Guide', 'Scheduling Best Practices']
            },
            {
              id: 'admin-3',
              title: 'Analytics & Reporting',
              description: 'Understanding reports, metrics, and data-driven decisions',
              status: 'not_started',
              due_date: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
              resources: ['Analytics Dashboard Guide', 'KPI Tracking']
            }
          ]
        : [
            {
              id: 'instructor-1',
              title: 'Teaching Methodology',
              description: 'Skill Samurai teaching approach and classroom management',
              status: 'not_started',
              due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
              resources: ['Teaching Guide', 'Classroom Management Tips']
            },
            {
              id: 'instructor-2',
              title: 'Curriculum & Lessons',
              description: 'Understanding our curriculum structure and lesson plans',
              status: 'not_started',
              due_date: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
              resources: ['Curriculum Overview', 'Lesson Planning Guide']
            },
            {
              id: 'instructor-3',
              title: 'Student Progress Tracking',
              description: 'Monitoring student progress and providing feedback',
              status: 'not_started',
              due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
              resources: ['Progress Tracking Guide', 'Parent Communication']
            }
          ];

      const tasks = instructor.role === 'admin'
        ? [
            {
              id: 'task-1',
              title: 'Complete profile setup',
              description: 'Add bio, contact information, and profile photo',
              completed: false,
              due_date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
              priority: 'high'
            },
            {
              id: 'task-2',
              title: 'Review current programs',
              description: 'Familiarize yourself with active programs and schedules',
              completed: false,
              due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
              priority: 'high'
            },
            {
              id: 'task-3',
              title: 'Meet the team',
              description: 'Schedule intro meetings with other instructors and staff',
              completed: false,
              due_date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
              priority: 'medium'
            }
          ]
        : [
            {
              id: 'task-1',
              title: 'Complete profile setup',
              description: 'Add bio, teaching experience, and profile photo',
              completed: false,
              due_date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
              priority: 'high'
            },
            {
              id: 'task-2',
              title: 'Review assigned classes',
              description: 'Check your class schedule and student roster',
              completed: false,
              due_date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
              priority: 'high'
            },
            {
              id: 'task-3',
              title: 'Shadow a class',
              description: 'Observe an experienced instructor teaching',
              completed: false,
              due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
              priority: 'medium'
            }
          ];

      // Create onboarding record
      await api.entities.InstructorOnboarding.create({
        userId: instructor.id,
        role: instructor.role,
        status: 'in_progress',
        welcome_email_sent: true,
        training_modules: trainingModules,
        tasks: tasks,
        progress_percentage: 0,
        started_at: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      setStep(1);
    } catch (error) {
      console.error('Error starting onboarding:', error);
      alert('Failed to start onboarding. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Instructor Onboarding
          </DialogTitle>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-6 py-4">
            <DialogDescription className="text-base">
              We'll automatically set up a personalized onboarding experience for <strong>{instructor.full_name}</strong>:
            </DialogDescription>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Welcome Email</h4>
                  <p className="text-sm text-slate-600">AI-generated personalized welcome message</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Training Modules</h4>
                  <p className="text-sm text-slate-600">Role-based learning materials and resources</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Onboarding Tasks</h4>
                  <p className="text-sm text-slate-600">Prioritized action items for the first weeks</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={startOnboarding}
              disabled={generating}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up onboarding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Onboarding
                </>
              )}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Onboarding Started!</h3>
              <p className="text-slate-600">
                Welcome email sent to {instructor.email}. Training modules and tasks have been assigned.
              </p>
            </div>
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}