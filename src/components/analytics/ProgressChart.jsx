import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

export default function ProgressChart({ sessions, type = 'timeline' }) {
  // Prepare data for timeline chart
  const prepareTimelineData = () => {
    const grouped = {};
    sessions.forEach(session => {
      const date = format(new Date(session.endTime), 'MMM d');
      if (!grouped[date]) {
        grouped[date] = { date, minutes: 0, sessions: 0, concepts: new Set() };
      }
      const duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 60000);
      grouped[date].minutes += duration;
      grouped[date].sessions += 1;
      session.conceptsTouched?.forEach(c => grouped[date].concepts.add(c));
    });

    return Object.values(grouped).map(item => ({
      ...item,
      concepts: item.concepts.size
    }));
  };

  // Prepare concept frequency data
  const prepareConceptData = () => {
    const conceptCounts = {};
    sessions.forEach(session => {
      session.conceptsTouched?.forEach(concept => {
        conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
      });
    });

    return Object.entries(conceptCounts)
      .map(([concept, count]) => ({
        concept: concept.replace(/_/g, ' ').substring(0, 20),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Prepare weekly progress data
  const prepareWeeklyData = () => {
    const weeks = {};
    sessions.forEach(session => {
      const date = new Date(session.endTime);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = format(weekStart, 'MMM d');
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, total: 0, exploration: 0, guided: 0 };
      }
      
      const duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 60000);
      weeks[weekKey].total += duration;
      
      if (session.explorationMode) {
        weeks[weekKey].exploration += duration;
      } else {
        weeks[weekKey].guided += duration;
      }
    });

    return Object.values(weeks);
  };

  if (type === 'timeline') {
    const data = prepareTimelineData();
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Learning Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="minutes" 
                stroke="#6366f1" 
                fill="#6366f1" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (type === 'concepts') {
    const data = prepareConceptData();
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top Concepts Practiced</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis type="category" dataKey="concept" stroke="#64748b" fontSize={11} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (type === 'weekly') {
    const data = prepareWeeklyData();
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Weekly Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="guided" stackId="a" fill="#6366f1" name="Guided Lessons" />
              <Bar dataKey="exploration" stackId="a" fill="#8b5cf6" name="Free Exploration" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return null;
}