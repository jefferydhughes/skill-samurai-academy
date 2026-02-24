/**
 * Coding Companion State Machine
 * Defines three states: LEARN ↔ EXPLORE ↔ REFLECT
 */

export const COMPANION_STATES = {
  LEARN: 'LEARN',
  EXPLORE: 'EXPLORE',
  REFLECT: 'REFLECT'
};

/**
 * State definitions with behavior rules
 */
export const STATE_DEFINITIONS = {
  [COMPANION_STATES.LEARN]: {
    name: 'Learn Mode',
    purpose: 'Deliver core curriculum',
    icon: '📘',
    color: 'indigo',
    aiConstraint: 'highly_constrained',
    
    allowed: [
      'Explain concepts using age-appropriate language',
      'Ask guiding questions',
      'Provide hints',
      'Scaffold with pseudocode, comments, TODO blocks',
      'Encourage prediction and testing'
    ],
    
    notAllowed: [
      'Full code solutions',
      'Introducing off-level concepts',
      'Open-ended AI generation',
      'Vibe coding'
    ],
    
    exampleResponse: "Let's think about what should happen first. If the player touches the block, what do you want the world to do?"
  },
  
  [COMPANION_STATES.EXPLORE]: {
    name: 'Explore Mode',
    purpose: 'Encourage experimentation',
    icon: '🚀',
    color: 'purple',
    aiConstraint: 'moderately_constrained',
    
    allowed: [
      'Create micro-lessons',
      'Reframe ideas into known concepts',
      'Scaffold partial implementations',
      'Encourage trial-and-error',
      'Allow limited AI generation (within permission matrix)'
    ],
    
    notAllowed: [
      'Concepts beyond permission matrix',
      'Black-box logic',
      'Silent AI completion'
    ],
    
    exampleResponse: "Let's try building just one small part of that idea first. What should happen when the player presses a key?"
  },
  
  [COMPANION_STATES.REFLECT]: {
    name: 'Reflect Mode',
    purpose: 'Make learning visible',
    icon: '✨',
    color: 'amber',
    aiConstraint: 'no_teaching',
    
    allowed: [
      'Summarize what was built',
      'Highlight thinking skills',
      'Celebrate effort',
      'Ask light reflective questions'
    ],
    
    notAllowed: [
      'Introducing new concepts',
      'Teaching',
      'Giving next-step instructions'
    ],
    
    exampleResponse: "Today, you experimented with movement and tested how changing values affects what happens in your game. That's real problem-solving work."
  }
};

/**
 * Transition rules and conditions
 */
export const TRANSITIONS = {
  LEARN_TO_EXPLORE: {
    from: COMPANION_STATES.LEARN,
    to: COMPANION_STATES.EXPLORE,
    conditions: [
      'Student asks creative question outside lesson',
      'Student finishes lesson early',
      'Student explicitly requests exploration'
    ],
    transitionPhrase: "That's a cool idea. Want to explore it together?",
    requiresApproval: false
  },
  
  EXPLORE_TO_LEARN: {
    from: COMPANION_STATES.EXPLORE,
    to: COMPANION_STATES.LEARN,
    conditions: [
      'Student wants to return to lesson',
      'Exploration naturally uses lesson concepts',
      'Time threshold reached'
    ],
    transitionPhrase: "You just practiced the same idea we're learning in this lesson — nice! Want to continue?",
    requiresApproval: false
  },
  
  LEARN_TO_REFLECT: {
    from: COMPANION_STATES.LEARN,
    to: COMPANION_STATES.REFLECT,
    conditions: [
      'Session nearing end',
      'Student completes lesson',
      'Natural stopping point'
    ],
    transitionPhrase: "Let's take a moment to look at what you learned today.",
    requiresApproval: false
  },
  
  EXPLORE_TO_REFLECT: {
    from: COMPANION_STATES.EXPLORE,
    to: COMPANION_STATES.REFLECT,
    conditions: [
      'Session nearing end',
      'Student completes exploratory build',
      'Natural stopping point'
    ],
    transitionPhrase: "That was some great exploring! Let's wrap up and see what we built.",
    requiresApproval: false
  },
  
  REFLECT_TO_LEARN: {
    from: COMPANION_STATES.REFLECT,
    to: COMPANION_STATES.LEARN,
    conditions: [
      'New session starts',
      'Student ready to continue'
    ],
    transitionPhrase: "Ready to build something new?",
    requiresApproval: false
  }
};

/**
 * State Machine Controller
 */
export class CompanionStateMachine {
  constructor(initialState = COMPANION_STATES.LEARN) {
    this.currentState = initialState;
    this.stateHistory = [{ state: initialState, timestamp: new Date() }];
    this.sessionStartTime = new Date();
  }
  
  getCurrentState() {
    return this.currentState;
  }
  
  getStateDefinition() {
    return STATE_DEFINITIONS[this.currentState];
  }
  
  /**
   * Check if transition is allowed
   */
  canTransition(toState) {
    const transitionKey = Object.keys(TRANSITIONS).find(key => 
      TRANSITIONS[key].from === this.currentState && 
      TRANSITIONS[key].to === toState
    );
    return !!transitionKey;
  }
  
  /**
   * Transition to new state
   */
  transition(toState, reason = null) {
    if (!this.canTransition(toState)) {
      console.warn(`Invalid transition from ${this.currentState} to ${toState}`);
      return false;
    }
    
    const transitionKey = Object.keys(TRANSITIONS).find(key => 
      TRANSITIONS[key].from === this.currentState && 
      TRANSITIONS[key].to === toState
    );
    
    const transition = TRANSITIONS[transitionKey];
    
    this.stateHistory.push({
      state: toState,
      timestamp: new Date(),
      reason: reason || transition.conditions[0],
      transitionPhrase: transition.transitionPhrase
    });
    
    this.currentState = toState;
    return true;
  }
  
  /**
   * Detect if student message suggests state transition
   */
  detectTransitionIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    // Exploration signals
    const explorationSignals = [
      'can i try',
      'can we add',
      'what if',
      'i want to make',
      'can i build'
    ];
    
    // Return to lesson signals
    const returnSignals = [
      'back to lesson',
      'continue lesson',
      'what was i doing'
    ];
    
    // Wrap up signals
    const reflectSignals = [
      "i'm done",
      'finished',
      'want to stop'
    ];
    
    if (this.currentState === COMPANION_STATES.LEARN) {
      if (explorationSignals.some(s => lowerMsg.includes(s))) {
        return { suggestedState: COMPANION_STATES.EXPLORE, confidence: 'high' };
      }
    }
    
    if (this.currentState === COMPANION_STATES.EXPLORE) {
      if (returnSignals.some(s => lowerMsg.includes(s))) {
        return { suggestedState: COMPANION_STATES.LEARN, confidence: 'high' };
      }
    }
    
    if (reflectSignals.some(s => lowerMsg.includes(s))) {
      return { suggestedState: COMPANION_STATES.REFLECT, confidence: 'medium' };
    }
    
    return null;
  }
  
  /**
   * Check if session should auto-transition to reflect
   */
  shouldAutoReflect(sessionMinutes = null) {
    const minutes = sessionMinutes || this.getSessionMinutes();
    
    // Auto-reflect after 40+ minutes
    if (minutes >= 40) {
      return true;
    }
    
    return false;
  }
  
  getSessionMinutes() {
    return Math.floor((new Date() - this.sessionStartTime) / 60000);
  }
  
  /**
   * Get state-specific prompt instructions
   */
  getStatePromptInstructions() {
    const state = STATE_DEFINITIONS[this.currentState];
    
    return `
═══════════════════════════════════════════════════

CURRENT COMPANION STATE: ${state.name.toUpperCase()}
Icon: ${state.icon}
Purpose: ${state.purpose}
AI Constraint Level: ${state.aiConstraint}

ALLOWED in this state:
${state.allowed.map(a => `✅ ${a}`).join('\n')}

NOT ALLOWED in this state:
${state.notAllowed.map(n => `❌ ${n}`).join('\n')}

Example ${state.name} response:
"${state.exampleResponse}"

${this.currentState === COMPANION_STATES.LEARN ? `
⚠️ LEARN MODE STRICT RULES:
- You are delivering core curriculum
- No full solutions, only hints and scaffolding
- Stay within lesson concepts
- Ask questions before explaining
` : ''}

${this.currentState === COMPANION_STATES.EXPLORE ? `
🎨 EXPLORE MODE FLEXIBILITY:
- Student curiosity is driving this
- You can create micro-lessons
- Still respect permission matrix
- Encourage experimentation safely
` : ''}

${this.currentState === COMPANION_STATES.REFLECT ? `
🌟 REFLECT MODE - NO TEACHING:
- This is narration and celebration only
- Summarize what was learned
- Highlight effort and thinking skills
- Do not introduce new concepts
- Prepare for parent report
` : ''}
`;
  }
  
  /**
   * Export state history for reporting
   */
  getStateReport() {
    return {
      currentState: this.currentState,
      sessionDuration: this.getSessionMinutes(),
      stateHistory: this.stateHistory,
      primaryState: this.getPrimaryState(),
      explorationRatio: this.getExplorationRatio()
    };
  }
  
  getPrimaryState() {
    const stateCounts = this.stateHistory.reduce((acc, entry) => {
      acc[entry.state] = (acc[entry.state] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(stateCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || this.currentState;
  }
  
  getExplorationRatio() {
    const exploreCount = this.stateHistory.filter(
      e => e.state === COMPANION_STATES.EXPLORE
    ).length;
    return exploreCount / Math.max(this.stateHistory.length, 1);
  }
}

/**
 * Create new state machine instance
 */
export function createStateMachine(initialState = COMPANION_STATES.LEARN) {
  return new CompanionStateMachine(initialState);
}