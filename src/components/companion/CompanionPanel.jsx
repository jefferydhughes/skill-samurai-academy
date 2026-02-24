import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb, 
  X,
  Loader2
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { buildCompanionPrompt, validateResponse } from './companionPrompts';
import { createStateMachine, COMPANION_STATES, STATE_DEFINITIONS } from './companionStateMachine';
import { quickValidate } from './companionQA';
import { trackConceptUsage } from './learningContextManager';
import IdeaFlagButton from './IdeaFlagButton';

const companionPersonalities = {
  tracy: {
    name: 'Tracy',
    emoji: '🦖',
    greeting: "Hi! I'm Tracy! Ready to explore some awesome coding together?"
  },
  leo: {
    name: 'Leo',
    emoji: '🦁',
    greeting: "Hello there. I'm Leo. Let's think through this step by step."
  },
  beakly: {
    name: 'Beakly',
    emoji: '🦉',
    greeting: "Hey! Beakly here! Let's build something cool together!"
  }
};

export default function CompanionPanel({ 
  studentId, 
  lessonId, 
  projectId,
  companionType = 'tracy',
  currentCode,
  currentLesson,
  onClose,
  collapsed = false
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [stateMachine, setStateMachine] = useState(null);
  const scrollRef = useRef(null);

  const companion = companionPersonalities[companionType] || companionPersonalities.tracy;

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const initSession = async () => {
    try {
      // Initialize state machine
      const sm = createStateMachine(lessonId ? COMPANION_STATES.LEARN : COMPANION_STATES.EXPLORE);
      setStateMachine(sm);
      
      const session = await api.entities.CompanionSession.create({
        studentId,
        lessonId,
        projectId,
        companionType,
        startTime: new Date().toISOString(),
        conceptsTouched: [],
        totalInteractions: 0
      });
      setSessionId(session.id);
      
      // Pass session ID to parent if available
      if (window.setCompanionSessionId) {
        window.setCompanionSessionId(session.id);
      }
      
      // Add greeting message
      setMessages([{
        role: 'companion',
        content: companion.greeting,
        timestamp: new Date(),
        state: sm.getCurrentState()
      }]);
    } catch (e) {
      console.error('Failed to init session:', e);
    }
  };

  const analyzeIntent = (message) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('how') || lowerMsg.includes('what')) {
      return 'how_to';
    } else if (lowerMsg.includes('stuck') || lowerMsg.includes('help') || lowerMsg.includes("don't understand")) {
      return 'frustration';
    } else if (lowerMsg.includes('can i') || lowerMsg.includes('add')) {
      return 'exploration';
    } else if (lowerMsg.includes('why') || lowerMsg.includes('mean')) {
      return 'clarification';
    }
    return 'curiosity';
  };

  const getCompanionResponse = async (userMessage, intent) => {
    // Check for state transition intent
    if (stateMachine) {
      const transitionIntent = stateMachine.detectTransitionIntent(userMessage);
      if (transitionIntent?.suggestedState) {
        const transitioned = stateMachine.transition(
          transitionIntent.suggestedState,
          'Student signal detected'
        );
        if (transitioned) {
          console.log(`Transitioned to ${transitionIntent.suggestedState}`);
        }
      }
      
      // Check if should auto-reflect
      if (stateMachine.shouldAutoReflect()) {
        stateMachine.transition(COMPANION_STATES.REFLECT, 'Session duration threshold');
      }
    }
    
    // Build context for AI
    const context = {
      student_age: 10, // Would come from student profile
      current_lesson: currentLesson?.title || 'exploration',
      current_concepts: currentLesson?.learningObjectives || [],
      code_context: currentCode ? JSON.stringify(currentCode).substring(0, 500) : null,
      intent_type: intent,
      companion_personality: companionType,
      state_machine: stateMachine,
      studentId,
      sessionId
    };

    const prompt = await buildCompanionPrompt(userMessage, context);

    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            response: { type: 'string' },
            response_mode: { 
              type: 'string',
              enum: ['explain', 'guide', 'scaffold', 'challenge', 'preview']
            },
            concepts: {
              type: 'array',
              items: { type: 'string' }
            },
            is_exploration: { type: 'boolean' }
          }
        }
      });

      // Quick QA validation
      const qaValidation = quickValidate(
        response.response,
        stateMachine?.getCurrentState(),
        context.conceptPermissions
      );
      
      if (!qaValidation.valid) {
        console.error('QA Validation failed:', qaValidation.reason);
        // In production, you might want to regenerate or flag for review
      }
      
      // Validate response quality
      const validation = validateResponse(
        response.response, 
        stateMachine?.getCurrentState(),
        null
      );
      if (!validation.valid) {
        console.warn('Response validation warnings:', validation.errors);
      }

      return response;
    } catch (e) {
      console.error('AI error:', e);
      return {
        response: "Hmm, I'm having trouble thinking right now. Can you ask that again?",
        response_mode: 'explain',
        concepts: [],
        is_exploration: false
      };
    }
  };



  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      const intent = analyzeIntent(userMessage);
      const aiResponse = await getCompanionResponse(userMessage, intent);

      // Save interaction
      await api.entities.CompanionInteraction.create({
        sessionId,
        studentId,
        studentMessage: userMessage,
        companionResponse: aiResponse.response,
        intentType: intent,
        responseMode: aiResponse.response_mode,
        conceptsMentioned: aiResponse.concepts || [],
        codeContext: currentCode
      });

      // Track concept usage in learning context
      const detectedConcepts = aiResponse.concepts || [];
      for (const concept of detectedConcepts) {
        try {
          await trackConceptUsage(
            studentId,
            concept,
            lessonId ? 'lesson' : 'free_play',
            lessonId || projectId || sessionId,
            `Practiced during ${stateMachine?.getCurrentState() || 'session'}`
          );
        } catch (e) {
          console.warn('Failed to track concept:', e);
        }
      }

      // Update session
      await api.entities.CompanionSession.update(sessionId, {
        conceptsTouched: aiResponse.concepts || [],
        explorationMode: aiResponse.is_exploration,
        totalInteractions: messages.filter(m => m.role === 'user').length + 1
      });

      // Add companion response
      setMessages(prev => [...prev, {
        role: 'companion',
        content: aiResponse.response,
        mode: aiResponse.response_mode,
        state: stateMachine?.getCurrentState(),
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error('Error:', e);
      setMessages(prev => [...prev, {
        role: 'companion',
        content: "Oops! Something went wrong. Can you try asking again?",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageIndex, helpful) => {
    const message = messages[messageIndex];
    if (message.role !== 'companion') return;

    // Update last interaction with feedback
    // In production, you'd track interaction IDs
    console.log('Feedback:', helpful ? 'helpful' : 'not helpful');
  };

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          size="lg"
          className="rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 w-16 h-16"
          onClick={onClose}
        >
          <span className="text-3xl">{companion.emoji}</span>
        </Button>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full border-0 shadow-lg">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-2xl">
              {companion.emoji}
            </div>
            <div>
              <CardTitle className="text-lg">{companion.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Coding Companion</Badge>
                {stateMachine && (
                  <Badge 
                    className={`text-xs ${
                      stateMachine.getCurrentState() === COMPANION_STATES.LEARN 
                        ? 'bg-indigo-100 text-indigo-700'
                        : stateMachine.getCurrentState() === COMPANION_STATES.EXPLORE
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {STATE_DEFINITIONS[stateMachine.getCurrentState()]?.icon} {STATE_DEFINITIONS[stateMachine.getCurrentState()]?.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' 
                    : 'bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm'
                } px-4 py-3`}>
                  {message.role === 'companion' && (
                    <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                      {message.state && STATE_DEFINITIONS[message.state] && (
                        <span>{STATE_DEFINITIONS[message.state].icon}</span>
                      )}
                      {message.mode && (
                        <>
                          {message.mode === 'guide' && <Lightbulb className="w-3 h-3" />}
                          <span className="capitalize">{message.mode}</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  {message.role === 'companion' && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => handleFeedback(index, true)}
                        className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleFeedback(index, false)}
                        className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-2">
          <div className="flex gap-2">
            <IdeaFlagButton
              studentId={studentId}
              sourceContext={{
                mode: stateMachine?.getCurrentState(),
                sessionId,
                projectId,
                lessonId
              }}
              relatedConcepts={messages[messages.length - 1]?.concepts || []}
            />
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Tip: I'm here to guide you, not solve everything for you!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}