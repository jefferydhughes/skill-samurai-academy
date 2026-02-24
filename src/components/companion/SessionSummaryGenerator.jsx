import { api } from '@/api/apiClient';

/**
 * Parent Report Templates
 */
const REPORT_TEMPLATES = {
  standard: {
    subject: "Today's Coding Session Summary for {{studentName}}",
    template: `Today, {{studentName}} worked inside a 3D game world and focused on building interactive features.

During this session, they practiced:
• Coding concepts: {{concepts}}
• Thinking skills: problem-solving, testing ideas, and fixing small mistakes

{{studentName}} showed {{behavior}} while working through today's activities.

Next, we'll continue building on these ideas by {{nextStep}}.`
  },
  exploration: {
    subject: "{{studentName}} Explored a New Game Idea Today 🚗",
    template: `Today, {{studentName}} went beyond the lesson and explored a creative idea in their game world.

They experimented with:
• controlling movement
• adjusting how objects behave
• testing different ideas to see what worked

This kind of exploration helps students learn how to turn ideas into step-by-step solutions — an important computational thinking skill.

We guided {{studentName}} through this exploration while still reinforcing core coding concepts.`
  },
  persistence: {
    subject: "A Great Example of Problem-Solving Today 💪",
    template: `Today, {{studentName}} ran into a challenge while building their game — and kept going.

They practiced:
• identifying what wasn't working
• testing small changes
• learning from mistakes

This kind of persistence is a key part of learning to code and think logically. Moments like this are where real learning happens.

We're proud of the effort {{studentName}} showed today.`
  },
  achievement: {
    subject: "🎉 {{studentName}} Reached a Coding Milestone!",
    template: `Congratulations! Today, {{studentName}} completed an important milestone in their coding journey.

They successfully demonstrated:
• {{achievement}}
• the ability to apply it independently in a 3D environment

This shows growing confidence and understanding of how code controls behavior in games and simulations.

We're excited to keep building on this progress.`
  },
  gentle_concern: {
    subject: "A Quick Update on {{studentName}}'s Coding Session",
    template: `Today, {{studentName}} spent some time exploring their coding world, but appeared to need a bit more support.

This is completely normal — learning to code involves trial, error, and confidence-building.

We'll continue guiding {{studentName}} step by step and encouraging questions and experimentation.

If you have any insights about how {{studentName}} learns best, we'd love to hear them.`
  }
};

/**
 * Translate coding concepts to parent-friendly language
 */
function translateConcepts(concepts) {
  const translations = {
    variables: "storing and tracking information",
    loops: "repeating actions efficiently",
    conditionals: "making decisions based on conditions",
    events: "responding to player actions",
    functions: "organizing code into reusable pieces",
    debugging: "finding and fixing issues",
    sequencing: "putting steps in the right order",
    npc_behavior: "making characters react and behave",
    physics: "understanding how objects move and interact"
  };
  
  return concepts
    .map(c => translations[c] || c.replace(/_/g, ' '))
    .join(', ') || 'exploration and experimentation';
}

/**
 * Generates parent-friendly session summary
 */
export async function generateSessionSummary(sessionId) {
  try {
    const sessions = await api.entities.CompanionSession.filter({ id: sessionId });
    const session = sessions[0];
    
    if (!session) return null;

    const interactions = await api.entities.CompanionInteraction.filter({ 
      sessionId 
    });

    // Get student info and learning profile
    const students = await api.entities.StudentProfile.filter({ id: session.studentId });
    const student = students[0];
    const studentName = student?.displayName || 'Your child';
    
    const learningProfile = {
      goals: student?.learningGoals || [],
      strengths: student?.strengths || [],
      growthAreas: student?.growthAreas || [],
      learningStyle: student?.learningStyle || 'mixed'
    };

    // Determine which template to use
    const duration = calculateDurationMinutes(session.startTime, session.endTime);
    const hasStruggles = session.strugglesIdentified?.length > 0;
    const hasExploration = session.explorationMode;
    const hasSuccess = session.successMoments?.length > 0;
    const lowEngagement = duration < 10 || interactions.length < 3;

    let templateKey = 'standard';
    if (lowEngagement && hasStruggles) {
      templateKey = 'gentle_concern';
    } else if (hasSuccess && session.lessonId) {
      templateKey = 'achievement';
    } else if (hasStruggles) {
      templateKey = 'persistence';
    } else if (hasExploration) {
      templateKey = 'exploration';
    }

    const template = REPORT_TEMPLATES[templateKey];
    
    // Build report using AI to fill in dynamic parts
    const prompt = `Generate specific content for a parent report about a child's coding session.

TEMPLATE TYPE: ${templateKey}

SESSION DATA:
- Student: ${studentName}
- Duration: ${duration} minutes
- Lesson: ${session.lessonId ? 'Guided lesson' : 'Free exploration'}
- Concepts touched: ${session.conceptsTouched?.join(', ') || 'exploration'}
- Exploration mode: ${session.explorationMode ? 'Yes' : 'No'}
- Struggles: ${session.strugglesIdentified?.join(', ') || 'none'}
- Success moments: ${session.successMoments?.join(', ') || 'steady progress'}

LEARNING PROFILE:
- Learning Goals: ${learningProfile.goals.join(', ') || 'exploring'}
- Known Strengths: ${learningProfile.strengths.join(', ') || 'developing'}
- Growth Areas: ${learningProfile.growthAreas.join(', ') || 'general development'}
- Learning Style: ${learningProfile.learningStyle}

CRITICAL RULES FOR PARENT REPORTS:
1. NO coding jargon (no "variable", "loop", "function" unless translated)
2. Focus on THINKING SKILLS, not syntax
3. Keep under 150 words
4. Encouraging, never judgmental
5. Translate concepts: "loops" → "repeating actions efficiently"
6. Reference learning profile where relevant (goals, strengths, growth areas)
7. Connect session activities to their learning style if applicable

Generate these fields:
- concepts: parent-friendly translation of coding concepts
- behavior: positive trait (curiosity/persistence/creativity)
- nextStep: simple description of what's next
- achievement: (if applicable) what they mastered in plain language

Return JSON only.`;

    const aiContent = await api.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          concepts: { type: 'string' },
          behavior: { type: 'string' },
          nextStep: { type: 'string' },
          achievement: { type: 'string' }
        }
      }
    });

    // Fill template
    let report = template.template
      .replace(/\{\{studentName\}\}/g, studentName)
      .replace(/\{\{concepts\}\}/g, aiContent.concepts || translateConcepts(session.conceptsTouched || []))
      .replace(/\{\{behavior\}\}/g, aiContent.behavior || 'curiosity and engagement')
      .replace(/\{\{nextStep\}\}/g, aiContent.nextStep || 'exploring more coding concepts')
      .replace(/\{\{achievement\}\}/g, aiContent.achievement || 'key coding concepts');

    const result = {
      subject: template.subject.replace(/\{\{studentName\}\}/g, studentName),
      summary: report,
      template_used: templateKey,
      key_concepts: session.conceptsTouched || [],
      duration_minutes: duration
    };

    // Update session
    await api.entities.CompanionSession.update(sessionId, {
      endTime: new Date().toISOString(),
      parentSummary: report
    });

    return result;
  } catch (e) {
    console.error('Failed to generate summary:', e);
    return null;
  }
}

function calculateDurationMinutes(start, end) {
  if (!start || !end) return 0;
  const diff = new Date(end) - new Date(start);
  return Math.floor(diff / 60000);
}

export async function getSessionSummary(sessionId) {
  try {
    const sessions = await api.entities.CompanionSession.filter({ id: sessionId });
    return sessions[0]?.parentSummary || null;
  } catch (e) {
    return null;
  }
}