import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, CheckCircle2, Target } from 'lucide-react';

export default function LearningGapsAnalysis({ sessions, learningContext = [] }) {
  // Analyze concept mastery from sessions
  const analyzeConceptMastery = () => {
    const conceptData = {};
    
    sessions.forEach(session => {
      session.conceptsTouched?.forEach(concept => {
        if (!conceptData[concept]) {
          conceptData[concept] = {
            name: concept,
            encounters: 0,
            totalDuration: 0,
            lastSeen: null,
            explorationCount: 0,
            guidedCount: 0
          };
        }
        
        conceptData[concept].encounters += 1;
        conceptData[concept].totalDuration += Math.floor(
          (new Date(session.endTime) - new Date(session.startTime)) / 60000
        );
        conceptData[concept].lastSeen = new Date(session.endTime);
        
        if (session.explorationMode) {
          conceptData[concept].explorationCount += 1;
        } else {
          conceptData[concept].guidedCount += 1;
        }
      });
    });

    return Object.values(conceptData).map(concept => {
      // Calculate mastery score (0-100)
      let masteryScore = 0;
      
      // More encounters = higher score
      masteryScore += Math.min(concept.encounters * 10, 40);
      
      // Both guided and exploration = better understanding
      if (concept.guidedCount > 0 && concept.explorationCount > 0) {
        masteryScore += 30;
      } else if (concept.guidedCount > 0) {
        masteryScore += 15;
      }
      
      // Time spent matters
      masteryScore += Math.min(concept.totalDuration / 10, 30);
      
      return {
        ...concept,
        masteryScore: Math.min(Math.round(masteryScore), 100)
      };
    }).sort((a, b) => a.masteryScore - b.masteryScore);
  };

  const concepts = analyzeConceptMastery();
  
  const needsAttention = concepts.filter(c => c.masteryScore < 40);
  const developing = concepts.filter(c => c.masteryScore >= 40 && c.masteryScore < 70);
  const proficient = concepts.filter(c => c.masteryScore >= 70);

  const getMasteryLabel = (score) => {
    if (score >= 70) return { label: 'Proficient', color: 'text-green-600' };
    if (score >= 40) return { label: 'Developing', color: 'text-amber-600' };
    return { label: 'Needs Practice', color: 'text-orange-600' };
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{proficient.length}</div>
                <div className="text-sm text-slate-600">Proficient</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{developing.length}</div>
                <div className="text-sm text-slate-600">Developing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{needsAttention.length}</div>
                <div className="text-sm text-slate-600">Needs Practice</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Concept Analysis */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Concept Mastery Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {concepts.slice(0, 15).map((concept, index) => {
              const mastery = getMasteryLabel(concept.masteryScore);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">
                        {concept.name.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {concept.encounters} {concept.encounters === 1 ? 'encounter' : 'encounters'} • 
                        {concept.totalDuration} min total
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${mastery.color} bg-transparent border-0`}>
                        {mastery.label}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-600">
                        {concept.masteryScore}%
                      </span>
                    </div>
                  </div>
                  <Progress value={concept.masteryScore} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {needsAttention.length > 0 && (
        <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Recommended Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.slice(0, 5).map((concept, index) => (
                <div key={index} className="bg-orange-50 rounded-lg p-4">
                  <div className="font-semibold text-slate-900 mb-1">
                    {concept.name.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-slate-600">
                    {concept.guidedCount === 0 
                      ? "Would benefit from structured lesson practice"
                      : concept.explorationCount === 0
                      ? "Ready for free exploration to reinforce learning"
                      : "Could use more practice time"
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}