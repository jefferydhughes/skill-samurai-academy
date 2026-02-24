/**
 * Learning Context Manager
 * Synchronizes learning progress across different platform interactions
 */

import { api } from '@/api/apiClient';

/**
 * Get recent learning context for a student
 */
export async function getRecentLearningContext(studentId, options = {}) {
  const {
    daysBack = 7,
    limit = 10
  } = options;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Get recent learning contexts
  const contexts = await api.entities.LearningContext.filter({ 
    studentId 
  });

  // Filter by recency and sort by last practiced
  const recentContexts = contexts
    .filter(ctx => new Date(ctx.lastPracticed) >= cutoffDate)
    .sort((a, b) => new Date(b.lastPracticed) - new Date(a.lastPracticed))
    .slice(0, limit);

  return recentContexts;
}

/**
 * Get active idea flags for a student
 */
export async function getActiveIdeaFlags(studentId) {
  const flags = await api.entities.IdeaFlag.filter({ 
    studentId,
    status: 'flagged'
  });

  return flags.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
}

/**
 * Track concept usage in a session
 */
export async function trackConceptUsage(studentId, conceptKey, sourceType, sourceId, notes = '') {
  // Find or create learning context
  const existingContexts = await api.entities.LearningContext.filter({
    studentId,
    conceptKey
  });

  const now = new Date().toISOString();
  
  if (existingContexts.length > 0) {
    const context = existingContexts[0];
    
    // Update existing context
    const updatedSources = [
      ...(context.contextSources || []),
      {
        sourceType,
        sourceId,
        timestamp: now,
        notes
      }
    ];

    await api.entities.LearningContext.update(context.id, {
      lastPracticed: now,
      encounterCount: (context.encounterCount || 1) + 1,
      contextSources: updatedSources
    });

    return context.id;
  } else {
    // Create new context
    const newContext = await api.entities.LearningContext.create({
      studentId,
      conceptKey,
      firstEncountered: now,
      lastPracticed: now,
      masteryLevel: 'introduced',
      encounterCount: 1,
      contextSources: [{
        sourceType,
        sourceId,
        timestamp: now,
        notes
      }],
      relatedConcepts: []
    });

    return newContext.id;
  }
}

/**
 * Update mastery level for a concept
 */
export async function updateMasteryLevel(studentId, conceptKey, masteryLevel) {
  const contexts = await api.entities.LearningContext.filter({
    studentId,
    conceptKey
  });

  if (contexts.length > 0) {
    await api.entities.LearningContext.update(contexts[0].id, {
      masteryLevel
    });
  }
}

/**
 * Flag an idea or problem for later
 */
export async function flagIdea(studentId, ideaData) {
  const flag = await api.entities.IdeaFlag.create({
    studentId,
    title: ideaData.title,
    description: ideaData.description,
    flagType: ideaData.flagType || 'creative_idea',
    sourceContext: ideaData.sourceContext || {},
    relatedConcepts: ideaData.relatedConcepts || [],
    status: 'flagged',
    aiSuggested: ideaData.aiSuggested || false,
    studentNotes: ideaData.studentNotes || ''
  });

  return flag;
}

/**
 * Build comprehensive learning context for companion
 */
export async function buildCompanionContext(studentId, currentMode, currentSessionId) {
  const [recentContexts, activeFlags, sessions] = await Promise.all([
    getRecentLearningContext(studentId, { daysBack: 14, limit: 15 }),
    getActiveIdeaFlags(studentId),
    api.entities.CompanionSession.filter({ studentId })
  ]);

  // Get recent sessions (last 5)
  const recentSessions = sessions
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  // Build context summary
  const conceptsByMastery = recentContexts.reduce((acc, ctx) => {
    if (!acc[ctx.masteryLevel]) acc[ctx.masteryLevel] = [];
    acc[ctx.masteryLevel].push(ctx.conceptKey);
    return acc;
  }, {});

  const conceptsInProgress = recentContexts
    .filter(ctx => ctx.masteryLevel === 'practicing')
    .map(ctx => ctx.conceptKey);

  const masteredConcepts = recentContexts
    .filter(ctx => ctx.masteryLevel === 'mastered')
    .map(ctx => ctx.conceptKey);

  return {
    recentContexts,
    activeFlags,
    recentSessions,
    summary: {
      conceptsByMastery,
      conceptsInProgress,
      masteredConcepts,
      totalConceptsEncountered: recentContexts.length,
      activeFlagsCount: activeFlags.length
    }
  };
}

/**
 * Generate context-aware prompt additions
 */
export function generateContextPrompt(learningContext) {
  const { summary, activeFlags, recentContexts } = learningContext;

  let prompt = `\n═══════════════════════════════════════════════════\n`;
  prompt += `CROSS-SESSION LEARNING CONTEXT\n\n`;

  // Mastered concepts
  if (summary.masteredConcepts.length > 0) {
    prompt += `MASTERED CONCEPTS (can build on these):\n`;
    prompt += summary.masteredConcepts.map(c => `• ${c.replace(/_/g, ' ')}`).join('\n');
    prompt += `\n\n`;
  }

  // Concepts in progress
  if (summary.conceptsInProgress.length > 0) {
    prompt += `CURRENTLY PRACTICING:\n`;
    prompt += summary.conceptsInProgress.map(c => `• ${c.replace(/_/g, ' ')}`).join('\n');
    prompt += `\n\n`;
  }

  // Active flags
  if (activeFlags.length > 0) {
    prompt += `FLAGGED IDEAS TO EXPLORE:\n`;
    activeFlags.slice(0, 3).forEach(flag => {
      prompt += `• ${flag.title} (${flag.flagType})\n`;
      if (flag.description) {
        prompt += `  → ${flag.description.substring(0, 100)}...\n`;
      }
    });
    prompt += `\n`;
  }

  // Recent learning patterns
  const recentSources = recentContexts
    .flatMap(ctx => ctx.contextSources || [])
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  if (recentSources.length > 0) {
    prompt += `RECENT LEARNING ACTIVITIES:\n`;
    recentSources.forEach(source => {
      prompt += `• ${source.sourceType}: ${source.notes || 'practice session'}\n`;
    });
    prompt += `\n`;
  }

  prompt += `COMPANION GUIDANCE:\n`;
  prompt += `• Reference mastered concepts when relevant\n`;
  prompt += `• Connect new ideas to what they're currently practicing\n`;
  prompt += `• Suggest revisiting flagged ideas when appropriate\n`;
  prompt += `• Note when free play connects to lesson concepts\n`;
  prompt += `═══════════════════════════════════════════════════\n`;

  return prompt;
}

/**
 * Detect if current activity relates to flagged ideas
 */
export function findRelatedFlags(currentConcepts, activeFlags) {
  return activeFlags.filter(flag => {
    const flagConcepts = flag.relatedConcepts || [];
    return flagConcepts.some(fc => currentConcepts.includes(fc));
  });
}