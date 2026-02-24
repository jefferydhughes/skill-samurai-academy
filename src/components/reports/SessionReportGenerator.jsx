import { api } from '@/api/apiClient';

export async function generateSessionReport(sessionData) {
  const { studentId, sessionId, lessonId, codeWritten, duration } = sessionData;

  try {
    // Fetch related data
    const student = await api.entities.StudentProfile.filter({ id: studentId });
    const lesson = lessonId ? await api.entities.Lesson.filter({ id: lessonId }) : null;
    const session = await api.entities.CompanionSession.filter({ id: sessionId });
    const interactions = await api.entities.CompanionInteraction.filter({ sessionId });

    const studentProfile = student[0];
    const lessonData = lesson?.[0];
    const sessionData = session[0];

    // Generate AI analysis of code and session
    const analysis = await api.integrations.Core.InvokeLLM({
      prompt: `Analyze this coding session for a ${studentProfile.age}-year-old student.

Session Details:
- Duration: ${duration} minutes
- Lesson: ${lessonData?.title || 'Free exploration'}
- Code written: ${codeWritten || 'No code recorded'}
- Interactions: ${interactions.length} with AI companion

Lesson Objectives (if applicable):
${lessonData?.learningObjectives?.join('\n') || 'N/A'}

Please analyze and provide:
1. Lines of code written (estimate)
2. Coding concepts applied (loops, variables, functions, conditionals, etc.)
3. Computer Science standards addressed (CSTA K-12 standards where applicable)
4. Which lesson objectives were met
5. Key achievements in this session
6. Recommended next steps

Provide a parent-friendly summary that:
- Celebrates what the child accomplished
- Explains technical concepts in simple terms
- Suggests ways parents can support continued learning
- Is encouraging and specific

Keep the tone warm, positive, and focused on growth.`,
      response_json_schema: {
        type: 'object',
        properties: {
          lines_of_code: { type: 'number' },
          concepts_applied: { type: 'array', items: { type: 'string' } },
          cs_standards: { type: 'array', items: { type: 'string' } },
          lesson_objectives_met: { type: 'array', items: { type: 'string' } },
          achievements: { type: 'array', items: { type: 'string' } },
          next_steps: { type: 'array', items: { type: 'string' } },
          parent_summary: { type: 'string' }
        }
      }
    });

    // Create session report
    const report = await api.entities.SessionReport.create({
      student_id: studentId,
      session_id: sessionId,
      lesson_id: lessonId,
      session_date: new Date().toISOString(),
      duration_minutes: duration,
      code_written: codeWritten || '',
      code_analysis: {
        lines_of_code: analysis.lines_of_code,
        concepts_applied: analysis.concepts_applied,
        cs_standards: analysis.cs_standards,
        lesson_objectives_met: analysis.lesson_objectives_met
      },
      progress_summary: analysis.parent_summary,
      achievements: analysis.achievements,
      next_steps: analysis.next_steps,
      parent_email_sent: false
    });

    // Get parent email
    const parent = await api.entities.User.filter({ id: studentProfile.userId });
    const parentEmail = parent[0]?.email;

    if (parentEmail) {
      // Send email to parent
      await api.integrations.Core.SendEmail({
        to: parentEmail,
        from_name: 'Skill Samurai',
        subject: `${studentProfile.displayName}'s Coding Session Report`,
        body: `Hi!

${studentProfile.displayName} just completed a coding session! Here's what happened:

📊 SESSION SUMMARY
• Duration: ${duration} minutes
• Lesson: ${lessonData?.title || 'Free exploration'}
• Lines of code: ${analysis.lines_of_code}
• Concepts practiced: ${analysis.concepts_applied.join(', ')}

🎯 WHAT ${studentProfile.displayName.toUpperCase()} ACCOMPLISHED
${analysis.achievements.map(a => `• ${a}`).join('\n')}

💡 COMPUTER SCIENCE STANDARDS ADDRESSED
${analysis.cs_standards.map(s => `• ${s}`).join('\n')}

${analysis.parent_summary}

🚀 NEXT STEPS
${analysis.next_steps.map(s => `• ${s}`).join('\n')}

Keep up the amazing work!

- The Skill Samurai Team

P.S. Have questions? Just reply to this email!`
      });

      // Update report to mark email as sent
      await api.entities.SessionReport.update(report.id, {
        parent_email_sent: true
      });
    }

    return report;
  } catch (error) {
    console.error('Error generating session report:', error);
    throw error;
  }
}