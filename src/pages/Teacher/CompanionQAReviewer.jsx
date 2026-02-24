import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Shield,
  Play
} from 'lucide-react';
import { evaluateResponse, generateQAReport } from '@/components/companion/companionQA';
import { COMPANION_STATES } from '@/components/companion/companionStateMachine';

const INTENT_TYPES = ['exploration', 'frustration', 'how_to', 'clarification', 'curiosity'];

export default function CompanionQAReviewer() {
  const [response, setResponse] = useState('');
  const [mode, setMode] = useState(COMPANION_STATES.LEARN);
  const [intentType, setIntentType] = useState('curiosity');
  const [studentAge, setStudentAge] = useState(10);
  const [evaluation, setEvaluation] = useState(null);

  const handleEvaluate = () => {
    const context = {
      currentMode: mode,
      responseMode: mode,
      intentType,
      studentAge,
      conceptPermissions: null,
      emotionalSignals: intentType === 'frustration' ? ['frustration'] : []
    };

    const result = evaluateResponse(response, context);
    setEvaluation(result);
  };

  const getCategoryIcon = (category) => {
    if (!evaluation) return null;
    const result = evaluation.categoryResults[category];
    return result?.pass ? (
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Companion QA Reviewer</h1>
        <p className="text-slate-600">Test AI responses against quality standards</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Response to Evaluate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste companion response here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="h-64"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Companion Mode</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={COMPANION_STATES.LEARN}>📘 Learn Mode</SelectItem>
                    <SelectItem value={COMPANION_STATES.EXPLORE}>🚀 Explore Mode</SelectItem>
                    <SelectItem value={COMPANION_STATES.REFLECT}>✨ Reflect Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Intent Type</label>
                <Select value={intentType} onValueChange={setIntentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTENT_TYPES.map(intent => (
                      <SelectItem key={intent} value={intent}>
                        {intent.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Student Age</label>
                <Select value={studentAge.toString()} onValueChange={(v) => setStudentAge(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 years</SelectItem>
                    <SelectItem value="9">9 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="11">11 years</SelectItem>
                    <SelectItem value="12">12 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleEvaluate}
              disabled={!response.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Run QA Evaluation
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!evaluation ? (
              <div className="text-center py-16 text-slate-400">
                <Shield className="w-16 h-16 mx-auto mb-4" />
                <p>Enter a response and run evaluation</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {/* Overall Status */}
                  <div className={`p-4 rounded-lg border-2 ${
                    evaluation.overallPass 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {evaluation.overallPass ? (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                      <div>
                        <div className="font-bold text-lg">
                          {evaluation.overallPass ? 'APPROVED' : 'REJECTED'}
                        </div>
                        <div className="text-sm opacity-70">
                          {evaluation.overallPass 
                            ? 'Response meets quality standards'
                            : 'Response has critical issues'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Critical Failures */}
                  {evaluation.criticalFailures.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900">
                          Critical Failures ({evaluation.criticalFailures.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {evaluation.criticalFailures.map((f, i) => (
                          <div key={i} className="text-sm">
                            <div className="font-medium text-red-800">{f.category}</div>
                            <div className="text-red-700">{f.check}</div>
                            {f.details && (
                              <div className="text-red-600 text-xs mt-1">→ {f.details}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {evaluation.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-900">
                          Warnings ({evaluation.warnings.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {evaluation.warnings.map((w, i) => (
                          <div key={i} className="text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {w.severity}
                              </Badge>
                              <span className="font-medium text-amber-800">{w.category}</span>
                            </div>
                            <div className="text-amber-700">{w.check}</div>
                            {w.details && (
                              <div className="text-amber-600 text-xs mt-1">→ {w.details}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">Category Breakdown</h3>
                    {Object.entries(evaluation.categoryResults).map(([key, category]) => (
                      <Card key={key} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(key)}
                              <div>
                                <div className="font-semibold">{category.name}</div>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {category.type}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {category.checks.map((check, i) => (
                              <div 
                                key={i} 
                                className={`text-sm pl-4 border-l-2 ${
                                  check.pass 
                                    ? 'border-green-300' 
                                    : 'border-red-300'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {check.pass ? (
                                    <span className="text-green-600 mt-0.5">✓</span>
                                  ) : (
                                    <span className="text-red-600 mt-0.5">✗</span>
                                  )}
                                  <div className="flex-1">
                                    <div>{check.description}</div>
                                    {check.details && (
                                      <div className="text-xs text-slate-500 mt-1">
                                        {check.details}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Raw Report */}
                  <details className="bg-slate-50 rounded-lg p-4">
                    <summary className="font-semibold cursor-pointer">
                      View Raw Report
                    </summary>
                    <pre className="text-xs mt-3 overflow-auto">
                      {generateQAReport(evaluation)}
                    </pre>
                  </details>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}