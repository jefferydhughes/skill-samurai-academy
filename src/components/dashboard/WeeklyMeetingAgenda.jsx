import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, TrendingUp, MessageSquare, Target, Trophy } from 'lucide-react';

export default function WeeklyMeetingAgenda({ snapshot, rocks, location }) {
  const [segue, setSegue] = useState('');
  const [scorecard, setScorecard] = useState('');
  const [rockReview, setRockReview] = useState('');
  const [customerEmployeeNews, setCustomerEmployeeNews] = useState('');
  const [todos, setTodos] = useState('');
  const [issues, setIssues] = useState('');
  const [conclusions, setConclusions] = useState('');

  const onTrackRocks = rocks.filter(r => r.status === 'on_track' || r.status === 'completed').length;
  const totalRocks = rocks.length;

  return (
    <div className="space-y-6">
      {/* Meeting Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Weekly Level 10 Meeting</h2>
              <p className="text-indigo-100">Agenda & Coaching Framework</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-indigo-100">Date</div>
              <div className="font-semibold">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-indigo-100">Week #</div>
              <div className="font-semibold">{snapshot?.week_number || '-'}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-indigo-100">Duration</div>
              <div className="font-semibold">90 minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* 1. Segue (5 min) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              1. Segue - Good News (5 min)
            </CardTitle>
            <p className="text-sm text-slate-600">Share personal & professional wins</p>
          </CardHeader>
          <CardContent className="p-6">
            {snapshot?.wins && snapshot.wins.length > 0 ? (
              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-700 mb-2">This Week's Wins:</div>
                <ul className="space-y-1">
                  {snapshot.wins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Textarea
              placeholder="Add good news from the team..."
              value={segue}
              onChange={(e) => setSegue(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* 2. Scorecard Review (5 min) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              2. Scorecard Review (5 min)
            </CardTitle>
            <p className="text-sm text-slate-600">Review weekly numbers</p>
          </CardHeader>
          <CardContent className="p-6">
            {snapshot && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600">Active Members</div>
                  <div className="text-xl font-bold text-blue-700">
                    {snapshot.member_metrics?.total_active || 0}
                  </div>
                  <div className="text-xs text-slate-500">
                    Target: {snapshot.member_metrics?.target || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600">New Members</div>
                  <div className="text-xl font-bold text-green-700">
                    {snapshot.member_metrics?.new_members || 0}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600">Conversion Rate</div>
                  <div className="text-xl font-bold text-purple-700">
                    {snapshot.trial_metrics?.conversion_rate || 0}%
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600">Attendance</div>
                  <div className="text-xl font-bold text-amber-700">
                    {snapshot.attendance_metrics?.attendance_percentage || 0}%
                  </div>
                </div>
              </div>
            )}
            <Textarea
              placeholder="Notes on numbers (trends, anomalies, insights)..."
              value={scorecard}
              onChange={(e) => setScorecard(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* 3. Rock Review (5 min) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-indigo-600" />
              3. Rock Review (5 min)
            </CardTitle>
            <p className="text-sm text-slate-600">On track or off track?</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Quarterly Rocks Status</span>
                <Badge className={onTrackRocks === totalRocks ? 'bg-green-500' : 'bg-amber-500'}>
                  {onTrackRocks}/{totalRocks} On Track
                </Badge>
              </div>
              <div className="space-y-2">
                {rocks.map(rock => (
                  <div key={rock.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">{rock.title}</span>
                    <Badge variant={rock.status === 'on_track' || rock.status === 'completed' ? 'default' : 'destructive'}>
                      {rock.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Rock discussion notes..."
              value={rockReview}
              onChange={(e) => setRockReview(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* 4. Customer/Employee Headlines (5 min) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-cyan-600" />
              4. Customer/Employee Headlines (5 min)
            </CardTitle>
            <p className="text-sm text-slate-600">Share feedback & updates</p>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              placeholder="Customer wins, parent feedback, employee updates..."
              value={customerEmployeeNews}
              onChange={(e) => setCustomerEmployeeNews(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* 5. To-Do List (5 min) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              5. To-Do List Review (5 min)
            </CardTitle>
            <p className="text-sm text-slate-600">Review last week's to-dos</p>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              placeholder="What got done? What's carried over?"
              value={todos}
              onChange={(e) => setTodos(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* 6. IDS (Identify, Discuss, Solve) - 60 min */}
        <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              🔥 6. IDS - Issues List (60 min)
            </CardTitle>
            <p className="text-sm text-slate-600">Identify • Discuss • Solve</p>
          </CardHeader>
          <CardContent className="p-6">
            {snapshot?.red_flags && snapshot.red_flags.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <div className="text-sm font-semibold text-red-900 mb-2">🚨 Red Flags from Scorecard:</div>
                <ul className="space-y-1">
                  {snapshot.red_flags.map((flag, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span>•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Textarea
              placeholder="List issues to solve (one per line)..."
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              rows={8}
            />
          </CardContent>
        </Card>

        {/* 7. Conclude (5 min) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              7. Conclude (5 min)
            </CardTitle>
            <p className="text-sm text-slate-600">Recap to-dos & rate meeting</p>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              placeholder="New to-dos, commitments, meeting rating (1-10)..."
              value={conclusions}
              onChange={(e) => setConclusions(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
        Save Meeting Notes & Send Summary
      </Button>
    </div>
  );
}