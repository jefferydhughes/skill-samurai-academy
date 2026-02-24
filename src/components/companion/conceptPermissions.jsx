/**
 * Concept Permission Matrix (Ages 8-12)
 * Defines what concepts can be taught at each age level
 */

export const PERMISSION_TYPES = {
  LEARN: 'LEARN',           // Core curriculum - teach and practice
  SCAFFOLD: 'SCAFFOLD',     // Partial help with TODOs and hints
  PREVIEW: 'PREVIEW',       // High-level exposure only, no implementation
  BLOCK: 'BLOCK'           // Not allowed - redirect gently
};

/**
 * Year 1 - Ages 8-9 (Explorer)
 * Goal: Cause → effect, confidence, spatial reasoning
 */
const YEAR_1_PERMISSIONS = {
  sequencing: { permission: 'LEARN', notes: 'Core concept' },
  events: { permission: 'LEARN', notes: 'Click, touch, enter area' },
  simple_conditionals: { permission: 'LEARN', notes: 'If only, no nesting' },
  position_3d: { permission: 'LEARN', notes: 'Intuitive language' },
  loops: { permission: 'PREVIEW', notes: 'Repeat concept only' },
  variables: { permission: 'PREVIEW', notes: 'Explained as labels' },
  functions: { permission: 'BLOCK', notes: 'Too abstract' },
  npc_behavior: { permission: 'PREVIEW', notes: 'Reactions only' },
  physics: { permission: 'LEARN', notes: 'Observational - gravity, collision' },
  debugging: { permission: 'SCAFFOLD', notes: 'Guided only' }
};

/**
 * Year 2 - Ages 9-10 (Builder)
 * Goal: Repetition, state, debugging
 */
const YEAR_2_PERMISSIONS = {
  sequencing: { permission: 'LEARN', notes: 'With intent' },
  events: { permission: 'LEARN', notes: 'Multiple events' },
  conditionals: { permission: 'LEARN', notes: 'If/else, no nesting' },
  loops: { permission: 'LEARN', notes: 'Simple loops' },
  variables: { permission: 'LEARN', notes: 'Score, speed, health' },
  debugging: { permission: 'LEARN', notes: 'Guided process' },
  functions: { permission: 'PREVIEW', notes: 'Reusable logic concept' },
  npc_states: { permission: 'SCAFFOLD', notes: 'Idle/chase only' },
  physics_tuning: { permission: 'LEARN', notes: 'Gravity, speed adjustments' },
  nested_conditionals: { permission: 'BLOCK', notes: 'Too complex' }
};

/**
 * Year 3 - Ages 10-11 (Engineer)
 * Goal: Systems thinking, coordination
 */
const YEAR_3_PERMISSIONS = {
  nested_conditionals: { permission: 'LEARN', notes: 'Limited depth' },
  loops: { permission: 'LEARN', notes: 'Nested loops allowed' },
  variables: { permission: 'LEARN', notes: 'Multiple states' },
  functions: { permission: 'LEARN', notes: 'Reusable behaviors' },
  events_coordination: { permission: 'LEARN', notes: 'System coordination' },
  npc_ai: { permission: 'LEARN', notes: 'Rule-based states' },
  physics_interactions: { permission: 'LEARN', notes: 'Collision logic' },
  lists: { permission: 'PREVIEW', notes: 'Small sets only' },
  optimization: { permission: 'PREVIEW', notes: 'Lag awareness' },
  ai_generation: { permission: 'SCAFFOLD', notes: 'Partial code only' }
};

/**
 * Year 4 - Ages 11-12 (Designer)
 * Goal: Intentional design, tradeoffs
 */
const YEAR_4_PERMISSIONS = {
  state_machines: { permission: 'LEARN', notes: 'Simplified' },
  lists: { permission: 'LEARN', notes: 'Inventory systems' },
  functions: { permission: 'LEARN', notes: 'Modular design' },
  optimization: { permission: 'LEARN', notes: 'Performance awareness' },
  save_load: { permission: 'LEARN', notes: 'Persistence' },
  npc_ai: { permission: 'LEARN', notes: 'Multi-state behavior' },
  pathfinding: { permission: 'PREVIEW', notes: 'Conceptual only' },
  data_structures: { permission: 'PREVIEW', notes: 'Abstract concepts' },
  ai_cocreation: { permission: 'LEARN', notes: 'Build/Free mode only' },
  advanced_physics: { permission: 'SCAFFOLD', notes: 'Guided implementation' }
};

/**
 * Master concept mapping
 * Maps student queries to concept categories
 */
export const CONCEPT_KEYWORDS = {
  // Variables & Data
  variables: ['variable', 'score', 'health', 'speed', 'counter', 'store', 'remember'],
  lists: ['list', 'array', 'collection', 'inventory', 'multiple items'],
  data_structures: ['dictionary', 'map', 'set', 'data structure'],
  
  // Control Flow
  sequencing: ['order', 'sequence', 'step by step', 'then'],
  conditionals: ['if', 'else', 'when', 'condition', 'check'],
  simple_conditionals: ['if only'],
  nested_conditionals: ['if inside if', 'multiple ifs', 'complex conditions'],
  loops: ['repeat', 'loop', 'again', 'multiple times', 'forever'],
  
  // Functions & Modularity
  functions: ['function', 'reuse', 'repeat code', 'define', 'make a block'],
  
  // Events & Interaction
  events: ['click', 'press', 'touch', 'key', 'when'],
  events_coordination: ['multiple events', 'trigger together', 'coordinate'],
  
  // 3D & Space
  position_3d: ['position', 'location', 'x', 'y', 'z', 'move', 'place'],
  
  // Game Logic
  npc_behavior: ['enemy', 'character', 'npc', 'follow', 'chase'],
  npc_states: ['enemy behavior', 'idle', 'patrol', 'attack'],
  npc_ai: ['ai enemy', 'smart enemy', 'learning enemy'],
  state_machines: ['state', 'mode', 'switch behavior'],
  
  // Physics
  physics: ['gravity', 'fall', 'collision', 'bounce'],
  physics_tuning: ['adjust gravity', 'change speed', 'tune physics'],
  physics_interactions: ['collision detection', 'hit', 'touch'],
  advanced_physics: ['realistic physics', 'momentum', 'friction'],
  
  // Advanced Concepts
  pathfinding: ['find path', 'navigate', 'route', 'go around'],
  optimization: ['faster', 'lag', 'slow', 'performance'],
  save_load: ['save', 'load', 'remember', 'continue later'],
  debugging: ['fix', 'error', 'not working', 'bug'],
  ai_generation: ['ai create', 'generate code'],
  ai_cocreation: ['ai help build', 'create together']
};

/**
 * Get age-appropriate permissions based on student age
 */
export function getPermissionsForAge(age) {
  if (age <= 9) return YEAR_1_PERMISSIONS;
  if (age === 10) return YEAR_2_PERMISSIONS;
  if (age === 11) return YEAR_3_PERMISSIONS;
  return YEAR_4_PERMISSIONS;
}

/**
 * Detect concepts from student message
 */
export function detectConcepts(message) {
  const lowerMessage = message.toLowerCase();
  const detected = [];
  
  for (const [concept, keywords] of Object.entries(CONCEPT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        detected.push(concept);
        break;
      }
    }
  }
  
  return [...new Set(detected)]; // Remove duplicates
}

/**
 * Check permission for a concept at given age
 */
export function checkPermission(concept, age) {
  const permissions = getPermissionsForAge(age);
  const conceptPermission = permissions[concept];
  
  if (!conceptPermission) {
    // Concept not in matrix - default to SCAFFOLD for safety
    return {
      permission: PERMISSION_TYPES.SCAFFOLD,
      notes: 'Concept not explicitly defined',
      allowed: true
    };
  }
  
  return {
    permission: conceptPermission.permission,
    notes: conceptPermission.notes,
    allowed: conceptPermission.permission !== PERMISSION_TYPES.BLOCK
  };
}

/**
 * Get guidance for how companion should respond based on permission
 */
export function getResponseGuidance(permission) {
  const guidance = {
    [PERMISSION_TYPES.LEARN]: {
      approach: 'TEACH',
      instruction: 'This is a core concept for this age. Teach it step-by-step with guided practice.',
      style: 'Break into small steps, ask guiding questions, encourage experimentation'
    },
    [PERMISSION_TYPES.SCAFFOLD]: {
      approach: 'PARTIAL_HELP',
      instruction: 'Provide hints and starter code with TODOs. Guide thinking but don\'t solve completely.',
      style: 'Use pseudocode, ask what they think goes in blanks, provide structure but not logic'
    },
    [PERMISSION_TYPES.PREVIEW]: {
      approach: 'EXPLAIN_ONLY',
      instruction: 'Give high-level explanation without implementation. Build curiosity for later learning.',
      style: 'Use analogies, explain the "what" and "why", but say "we\'ll learn to build this later"'
    },
    [PERMISSION_TYPES.BLOCK]: {
      approach: 'REDIRECT',
      instruction: 'Gently redirect to an age-appropriate alternative. Validate curiosity but set clear boundary.',
      style: 'Acknowledge the idea is cool, explain it\'s advanced, offer a similar but simpler concept'
    }
  };
  
  return guidance[permission] || guidance[PERMISSION_TYPES.SCAFFOLD];
}

/**
 * Generate redirect message for blocked concepts
 */
export function generateRedirect(concept, age, alternativeConcept = null) {
  const redirects = {
    functions: {
      message: "That's a really cool idea! Functions are powerful, but they're a bit tricky right now.",
      alternative: "For now, let's focus on making things happen in order. Want to try that?"
    },
    npc_ai: {
      message: "Enemies that learn? That's real AI - super advanced thinking!",
      alternative: "Right now, we can make enemies that react based on rules. Want to try making an enemy chase you?"
    },
    advanced_physics: {
      message: "Realistic physics is awesome! That's something we'll build up to.",
      alternative: "For now, let's play with gravity and speed. Want to make something jump higher?"
    },
    data_structures: {
      message: "Those are advanced programming ideas!",
      alternative: "Right now, let's use simple variables to store things. Ready?"
    }
  };
  
  const redirect = redirects[concept] || {
    message: "That's an advanced idea we'll learn later!",
    alternative: alternativeConcept 
      ? `For now, let's try ${alternativeConcept}.`
      : "Let's focus on what we're learning now."
  };
  
  return `${redirect.message}\n\n${redirect.alternative}`;
}

/**
 * Main permission check function
 * Returns comprehensive guidance for the companion
 */
export function evaluateConceptPermissions(message, age) {
  const concepts = detectConcepts(message);
  const evaluations = concepts.map(concept => ({
    concept,
    ...checkPermission(concept, age),
    guidance: getResponseGuidance(checkPermission(concept, age).permission)
  }));
  
  // Find most restrictive permission
  const blocked = evaluations.find(e => e.permission === PERMISSION_TYPES.BLOCK);
  const preview = evaluations.find(e => e.permission === PERMISSION_TYPES.PREVIEW);
  const scaffold = evaluations.find(e => e.permission === PERMISSION_TYPES.SCAFFOLD);
  const learn = evaluations.find(e => e.permission === PERMISSION_TYPES.LEARN);
  
  const primary = blocked || preview || scaffold || learn;
  
  return {
    detected_concepts: concepts,
    evaluations,
    primary_permission: primary?.permission || PERMISSION_TYPES.SCAFFOLD,
    primary_concept: primary?.concept,
    guidance: primary?.guidance,
    should_redirect: !!blocked,
    redirect_message: blocked ? generateRedirect(blocked.concept, age) : null
  };
}