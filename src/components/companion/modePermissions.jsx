/**
 * AI Permission Matrix by Mode
 * Controls what AI actions are allowed in each companion mode
 */

import { COMPANION_STATES } from './companionStateMachine';

/**
 * AI Actions - comprehensive list
 */
export const AI_ACTIONS = {
  // Explanation & Guidance
  EXPLAIN_CONCEPT: 'explain_concept',
  ASK_QUESTION: 'ask_question',
  REPHRASE_INSTRUCTION: 'rephrase_instruction',
  OFFER_HINT: 'offer_hint',
  
  // Code Assistance
  PROVIDE_PSEUDOCODE: 'provide_pseudocode',
  PROVIDE_COMMENTS: 'provide_comments',
  PROVIDE_TODO: 'provide_todo',
  PARTIAL_SCAFFOLD: 'partial_scaffold',
  GENERATE_SNIPPET: 'generate_snippet',
  FULL_SOLUTION: 'full_solution',
  
  // Teaching
  INTRODUCE_NEW_CONCEPT: 'introduce_new_concept',
  CREATE_MICROLESSON: 'create_microlesson',
  SUGGEST_APPROACHES: 'suggest_approaches',
  
  // World/Logic
  GENERATE_WORLD_LOGIC: 'generate_world_logic',
  AUTO_FIX: 'auto_fix',
  SILENT_EXECUTION: 'silent_execution',
  
  // Creative
  VIBE_CODING: 'vibe_coding',
  ASSET_SUGGESTION: 'asset_suggestion',
  FULL_GENERATION: 'full_generation'
};

/**
 * Permission levels
 */
export const PERMISSION_LEVEL = {
  ALLOWED: 'allowed',
  CONDITIONAL: 'conditional',
  BLOCKED: 'blocked'
};

/**
 * Mode Definitions with Permission Rules
 */
export const MODE_PERMISSIONS = {
  [COMPANION_STATES.LEARN]: {
    name: 'Learn Mode',
    purpose: 'Skill acquisition, assessment integrity, confidence-building',
    aiRole: 'Coach + Guide (never a builder)',
    
    permissions: {
      // Allowed
      [AI_ACTIONS.EXPLAIN_CONCEPT]: { 
        level: PERMISSION_LEVEL.ALLOWED,
        condition: 'Concept already introduced'
      },
      [AI_ACTIONS.ASK_QUESTION]: { 
        level: PERMISSION_LEVEL.ALLOWED 
      },
      [AI_ACTIONS.REPHRASE_INSTRUCTION]: { 
        level: PERMISSION_LEVEL.ALLOWED 
      },
      [AI_ACTIONS.OFFER_HINT]: { 
        level: PERMISSION_LEVEL.ALLOWED 
      },
      [AI_ACTIONS.PROVIDE_PSEUDOCODE]: { 
        level: PERMISSION_LEVEL.ALLOWED 
      },
      [AI_ACTIONS.PROVIDE_COMMENTS]: { 
        level: PERMISSION_LEVEL.ALLOWED 
      },
      [AI_ACTIONS.PROVIDE_TODO]: { 
        level: PERMISSION_LEVEL.ALLOWED 
      },
      
      // Conditional
      [AI_ACTIONS.PARTIAL_SCAFFOLD]: {
        level: PERMISSION_LEVEL.CONDITIONAL,
        condition: 'Concept is LEARN or SCAFFOLD for age, solution incomplete by design'
      },
      
      // Blocked
      [AI_ACTIONS.FULL_SOLUTION]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Undermines learning'
      },
      [AI_ACTIONS.INTRODUCE_NEW_CONCEPT]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Outside curriculum flow'
      },
      [AI_ACTIONS.GENERATE_SNIPPET]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Too much code'
      },
      [AI_ACTIONS.VIBE_CODING]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Wrong mode'
      },
      [AI_ACTIONS.AUTO_FIX]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Student must debug'
      },
      [AI_ACTIONS.SILENT_EXECUTION]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'No transparency'
      },
      [AI_ACTIONS.FULL_GENERATION]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Wrong mode'
      }
    },
    
    boundaryLanguage: "I can help you think this through, but you'll need to write this part."
  },
  
  [COMPANION_STATES.EXPLORE]: {
    name: 'Explore Mode',
    purpose: 'Curiosity, branching, creativity — without chaos',
    aiRole: 'Co-thinker + Scaffold',
    
    permissions: {
      // Allowed
      [AI_ACTIONS.EXPLAIN_CONCEPT]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.ASK_QUESTION]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.REPHRASE_INSTRUCTION]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.OFFER_HINT]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.PROVIDE_PSEUDOCODE]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.PROVIDE_COMMENTS]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.PROVIDE_TODO]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.CREATE_MICROLESSON]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.SUGGEST_APPROACHES]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.PARTIAL_SCAFFOLD]: { level: PERMISSION_LEVEL.ALLOWED },
      
      // Conditional
      [AI_ACTIONS.INTRODUCE_NEW_CONCEPT]: {
        level: PERMISSION_LEVEL.CONDITIONAL,
        condition: 'Only if marked PREVIEW or SCAFFOLD for age, labeled as "advanced"'
      },
      [AI_ACTIONS.GENERATE_SNIPPET]: {
        level: PERMISSION_LEVEL.CONDITIONAL,
        condition: 'Student must modify or complete, explanation required'
      },
      [AI_ACTIONS.ASSET_SUGGESTION]: {
        level: PERMISSION_LEVEL.CONDITIONAL,
        condition: 'With explanation'
      },
      
      // Blocked
      [AI_ACTIONS.FULL_SOLUTION]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'End-to-end solutions not allowed'
      },
      [AI_ACTIONS.VIBE_CODING]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Use Free Play mode'
      },
      [AI_ACTIONS.AUTO_FIX]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Black-box logic'
      },
      [AI_ACTIONS.SILENT_EXECUTION]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Must explain'
      },
      [AI_ACTIONS.FULL_GENERATION]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Use Free Play mode'
      }
    },
    
    boundaryLanguage: "I'll get you started — you decide how to finish it."
  },
  
  // Future: Free Play Mode
  FREE_PLAY: {
    name: 'Free Play Mode',
    purpose: 'Creativity, expression, motivation, joy',
    aiRole: 'Creative collaborator (with transparency)',
    
    permissions: {
      // Almost everything allowed
      [AI_ACTIONS.EXPLAIN_CONCEPT]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.ASK_QUESTION]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.OFFER_HINT]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.PROVIDE_PSEUDOCODE]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.PARTIAL_SCAFFOLD]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.GENERATE_SNIPPET]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.CREATE_MICROLESSON]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.SUGGEST_APPROACHES]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.VIBE_CODING]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.ASSET_SUGGESTION]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.FULL_GENERATION]: { level: PERMISSION_LEVEL.ALLOWED },
      [AI_ACTIONS.GENERATE_WORLD_LOGIC]: { level: PERMISSION_LEVEL.ALLOWED },
      
      // Still required
      [AI_ACTIONS.FULL_SOLUTION]: {
        level: PERMISSION_LEVEL.CONDITIONAL,
        condition: 'Must explain what was generated, label AI sections, encourage modification'
      },
      
      // Still blocked
      [AI_ACTIONS.SILENT_EXECUTION]: { 
        level: PERMISSION_LEVEL.BLOCKED,
        reason: 'Transparency required even in Free Play'
      },
      [AI_ACTIONS.AUTO_FIX]: {
        level: PERMISSION_LEVEL.CONDITIONAL,
        condition: 'With confirmation and explanation'
      }
    },
    
    boundaryLanguage: "I can build this with you — let's create something cool!",
    note: 'Free Play work is not graded and does not advance curriculum level'
  }
};

/**
 * Cross-mode rules that always apply
 */
export const UNIVERSAL_RULES = [
  'Respect age-based concept permissions',
  'Use age-appropriate language',
  'Ask before acting',
  'Be transparent about what was generated',
  'Encourage student agency',
  'Log learning signals for reports'
];

/**
 * Check if an AI action is permitted
 */
export function checkActionPermission(action, mode, conceptPermission = null) {
  const modeConfig = MODE_PERMISSIONS[mode];
  
  if (!modeConfig) {
    return {
      allowed: false,
      reason: 'Invalid mode'
    };
  }
  
  const permission = modeConfig.permissions[action];
  
  if (!permission) {
    return {
      allowed: false,
      reason: 'Action not defined for this mode'
    };
  }
  
  if (permission.level === PERMISSION_LEVEL.BLOCKED) {
    return {
      allowed: false,
      reason: permission.reason,
      boundaryLanguage: modeConfig.boundaryLanguage
    };
  }
  
  if (permission.level === PERMISSION_LEVEL.CONDITIONAL) {
    return {
      allowed: true,
      conditional: true,
      condition: permission.condition,
      conceptPermission
    };
  }
  
  return {
    allowed: true,
    conditional: false
  };
}

/**
 * Generate permission instructions for AI prompt
 */
export function getModePermissionInstructions(mode) {
  const modeConfig = MODE_PERMISSIONS[mode];
  
  if (!modeConfig) return '';
  
  const allowed = Object.entries(modeConfig.permissions)
    .filter(([, p]) => p.level === PERMISSION_LEVEL.ALLOWED)
    .map(([action]) => action);
  
  const conditional = Object.entries(modeConfig.permissions)
    .filter(([, p]) => p.level === PERMISSION_LEVEL.CONDITIONAL)
    .map(([action, p]) => ({ action, condition: p.condition }));
  
  const blocked = Object.entries(modeConfig.permissions)
    .filter(([, p]) => p.level === PERMISSION_LEVEL.BLOCKED)
    .map(([action, p]) => ({ action, reason: p.reason }));
  
  return `
═══════════════════════════════════════════════════

AI PERMISSION MATRIX - ${modeConfig.name.toUpperCase()}

Purpose: ${modeConfig.purpose}
Your Role: ${modeConfig.aiRole}

ALLOWED AI ACTIONS:
${allowed.map(a => `✅ ${a.replace(/_/g, ' ')}`).join('\n')}

CONDITIONAL ACTIONS (check requirements):
${conditional.map(c => `⚠️ ${c.action.replace(/_/g, ' ')}
   → ${c.condition}`).join('\n\n')}

BLOCKED ACTIONS:
${blocked.map(b => `🚫 ${b.action.replace(/_/g, ' ')}
   → Reason: ${b.reason}`).join('\n\n')}

BOUNDARY LANGUAGE:
When you must refuse, say: "${modeConfig.boundaryLanguage}"

UNIVERSAL RULES (always enforced):
${UNIVERSAL_RULES.map(r => `• ${r}`).join('\n')}

Before ANY AI output, verify:
1. What mode are we in? → ${modeConfig.name}
2. Is this action allowed in this mode?
3. Is the concept allowed for this age?
4. Can the student still learn by doing?

If ANY answer is "no" → redirect using boundary language.
`;
}

/**
 * Example enforcement case
 */
export function getEnforcementExample(studentAge, mode, request) {
  const examples = {
    [COMPANION_STATES.LEARN]: {
      request: "Just build the car for me.",
      decision: {
        mode: 'Learn',
        action: AI_ACTIONS.FULL_SOLUTION,
        allowed: false,
        reason: 'Full solutions blocked in Learn Mode'
      },
      response: "I can't build it for you — but I can help you figure it out step by step."
    },
    [COMPANION_STATES.EXPLORE]: {
      request: "Can you write all the code for an AI enemy?",
      decision: {
        mode: 'Explore',
        action: AI_ACTIONS.FULL_SOLUTION,
        allowed: false,
        reason: 'End-to-end solutions not allowed'
      },
      response: "I'll get you started with the enemy's basic movement — you decide how it should chase the player."
    }
  };
  
  return examples[mode] || examples[COMPANION_STATES.LEARN];
}

/**
 * Validate that response follows mode permissions
 */
export function validateModeCompliance(response, mode, detectedActions) {
  const violations = [];
  
  for (const action of detectedActions) {
    const permission = checkActionPermission(action, mode);
    if (!permission.allowed) {
      violations.push({
        action,
        reason: permission.reason
      });
    }
  }
  
  // Check for full code blocks in Learn mode
  if (mode === COMPANION_STATES.LEARN) {
    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks = response.match(codeBlockPattern);
    if (codeBlocks) {
      for (const block of codeBlocks) {
        if (!block.includes('TODO') && !block.includes('//') && !block.includes('...')) {
          violations.push({
            action: AI_ACTIONS.FULL_SOLUTION,
            reason: 'Complete code solution detected in Learn Mode'
          });
        }
      }
    }
  }
  
  return {
    compliant: violations.length === 0,
    violations
  };
}