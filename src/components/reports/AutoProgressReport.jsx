import { api } from '@/api/apiClient';
import { subDays } from 'date-fns';

export async function generateWeeklyProgressReport(studentId) {
  try {
    // Fetch student data
    const studentProfiles = await api.entities.StudentProfile.filter({ id: studentId });
    const student = studentProfiles[0];
    
    if (!student) throw new Error('Student not found');

    // Get progress from last week
    const weekAgo = subDays(new Date(), 7);
    const allProgress = await api.entities.LessonProgress.filter({ studentId });
    const recentProgress = allProgress.filter(p => new Date(p.updated_date) >= weekAgo);
    
    // Get all lessons for context
    const lessons = await api.entities.Lesson.list();
    
    // Get companion sessions from last week
    const sessions = await api.entities.CompanionSession.filter({ studentId });
    const recentSessions = sessions.filter(s => new Date(s.startTime) >= weekAgo);

    // Calculate metrics
    const lessonsCompleted = recentProgress.filter(p => p.completed).length;
    const totalTimeMinutes = recentSessions.reduce((sum, s) => {
      if (s.startTime && s.endTime) {
        return sum + (new Date(s.endTime) - new Date(s.startTime)) / 60000;
      }
      return sum;
    }, 0);

    const conceptsTouched = [...new Set(recentSessions.flatMap(s => s.conceptsTouched || []))];

    // Generate AI report
    const report = await api.integrations.Core.InvokeLLM({
      prompt: `Create a weekly progress report for ${student.displayName}, a ${student.age}-year-old student.

This Week's Activity:
- Lessons completed: ${lessonsCompleted}
- Total coding time: ${Math.round(totalTimeMinutes)} minutes
- Concepts explored: ${conceptsTouched.join(', ')}
- Sessions: ${recentSessions.length}

Student Background:
- Grade: ${student.gradeRange}
- Strengths: ${student.strengths?.join(', ') || 'Still discovering'}
- Learning goals: ${student.learningGoals?.join(', ') || 'General coding skills'}

Create an encouraging, parent-friendly report that:
1. Summarizes the week's activities
2. Highlights key achievements and breakthroughs
3. Notes areas of strong engagement
4. Provides specific examples of what they learned
5. Suggests ways parents can support continued learning
6. Sets positive expectations for next week

Keep it warm, specific, and celebration-focused. Use clear language that parents without coding backgrounds can understand.`,
    });

    // Get parent email
    const parents = await api.entities.User.filter({ id: student.userId });
    const parentEmail = parents[0]?.email;

    if (parentEmail) {
      // Send email
      await api.integrations.Core.SendEmail({
        to: parentEmail,
        from_name: 'Skill Samurai',
        subject: `${student.displayName}'s Weekly Coding Progress 🚀`,
        body: `Hi!

Here's ${student.displayName}'s coding journey this week:

📊 WEEKLY SNAPSHOT
• Lessons completed: ${lessonsCompleted}
• Time spent coding: ${Math.round(totalTimeMinutes)} minutes
• Practice sessions: ${recentSessions.length}
• New concepts explored: ${conceptsTouched.length}

${report}

Keep encouraging ${student.displayName}'s curiosity and creativity!

- The Skill Samurai Team

---
This is an automated weekly progress report. Have questions? Just reply to this email!`
      });

      return { success: true, report };
    }

    return { success: false, error: 'Parent email not found' };
  } catch (error) {
    console.error('Error generating progress report:', error);
    return { success: false, error: error.message };
  }
}

// Function to schedule weekly reports for all active students
export async function scheduleWeeklyReports() {
  try {
    const students = await api.entities.StudentProfile.list();
    const reports = [];

    for (const student of students) {
      const result = await generateWeeklyProgressReport(student.id);
      reports.push({ studentId: student.id, ...result });
    }

    return reports;
  } catch (error) {
    console.error('Error scheduling reports:', error);
    return [];
  }
}