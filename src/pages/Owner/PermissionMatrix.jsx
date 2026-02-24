import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  getPermissionsForAge, 
  evaluateConceptPermissions,
  PERMISSION_TYPES 
} from '@/components/companion/conceptPermissions';
import { BookOpen, Wrench, Eye, Ban, Search } from 'lucide-react';

const permissionIcons = {
  [PERMISSION_TYPES.LEARN]: <BookOpen className="w-4 h-4" />,
  [PERMISSION_TYPES.SCAFFOLD]: <Wrench className="w-4 h-4" />,
  [PERMISSION_TYPES.PREVIEW]: <Eye className="w-4 h-4" />,
  [PERMISSION_TYPES.BLOCK]: <Ban className="w-4 h-4" />
};

const permissionColors = {
  [PERMISSION_TYPES.LEARN]: 'bg-green-100 text-green-700 border-green-300',
  [PERMISSION_TYPES.SCAFFOLD]: 'bg-blue-100 text-blue-700 border-blue-300',
  [PERMISSION_TYPES.PREVIEW]: 'bg-amber-100 text-amber-700 border-amber-300',
  [PERMISSION_TYPES.BLOCK]: 'bg-red-100 text-red-700 border-red-300'
};

const ageGroups = [
  { age: 8, label: 'Year 1 (Ages 8-9)', role: 'Explorer' },
  { age: 10, label: 'Year 2 (Ages 9-10)', role: 'Builder' },
  { age: 11, label: 'Year 3 (Ages 10-11)', role: 'Engineer' },
  { age: 12, label: 'Year 4 (Ages 11-12)', role: 'Designer' }
];

export default function PermissionMatrix() {
  const [selectedAge, setSelectedAge] = useState(8);
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState(null);

  const permissions = getPermissionsForAge(selectedAge);

  const handleTest = () => {
    if (!testMessage.trim()) return;
    const result = evaluateConceptPermissions(testMessage, selectedAge);
    setTestResult(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Concept Permission Matrix</h1>
        <p className="text-slate-600">Age-based boundaries for AI companion teaching</p>
      </div>

      {/* Age Selector */}
      <div className="flex gap-2">
        {ageGroups.map(group => (
          <Button
            key={group.age}
            variant={selectedAge === group.age ? 'default' : 'outline'}
            onClick={() => setSelectedAge(group.age)}
            className="flex-1"
          >
            <div className="text-center">
              <div className="font-semibold">{group.label}</div>
              <div className="text-xs opacity-70">{group.role}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Permission Legend */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <Badge className={permissionColors[PERMISSION_TYPES.LEARN]}>
                {permissionIcons[PERMISSION_TYPES.LEARN]}
                LEARN
              </Badge>
              <span className="text-xs text-slate-600">Teach & practice</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={permissionColors[PERMISSION_TYPES.SCAFFOLD]}>
                {permissionIcons[PERMISSION_TYPES.SCAFFOLD]}
                SCAFFOLD
              </Badge>
              <span className="text-xs text-slate-600">Hints & TODOs</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={permissionColors[PERMISSION_TYPES.PREVIEW]}>
                {permissionIcons[PERMISSION_TYPES.PREVIEW]}
                PREVIEW
              </Badge>
              <span className="text-xs text-slate-600">Explain only</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={permissionColors[PERMISSION_TYPES.BLOCK]}>
                {permissionIcons[PERMISSION_TYPES.BLOCK]}
                BLOCK
              </Badge>
              <span className="text-xs text-slate-600">Redirect gently</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Allowed Concepts for {selectedAge === 8 ? 'Ages 8-9' : selectedAge === 10 ? 'Ages 9-10' : selectedAge === 11 ? 'Ages 10-11' : 'Ages 11-12'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(permissions).map(([concept, data]) => (
              <div 
                key={concept}
                className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 capitalize">
                    {concept.replace(/_/g, ' ')}
                  </h4>
                  <Badge className={`${permissionColors[data.permission]} border`}>
                    {permissionIcons[data.permission]}
                    <span className="ml-1">{data.permission}</span>
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{data.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Test Concept Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a student question... (e.g., 'How can I add a car to my game?')"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTest()}
              className="flex-1"
            />
            <Button onClick={handleTest} disabled={!testMessage.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Test
            </Button>
          </div>

          {testResult && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Detection Result</h4>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600">Detected concepts: </span>
                    {testResult.detected_concepts.length > 0 ? (
                      <span className="font-medium">
                        {testResult.detected_concepts.join(', ')}
                      </span>
                    ) : (
                      <span className="text-slate-400">None detected</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Primary permission: </span>
                    <Badge className={permissionColors[testResult.primary_permission]}>
                      {permissionIcons[testResult.primary_permission]}
                      {testResult.primary_permission}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-slate-600">Approach: </span>
                    <span className="font-medium">{testResult.guidance?.approach}</span>
                  </div>

                  {testResult.should_redirect && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="font-semibold text-red-900 mb-1">Would Redirect:</div>
                      <div className="text-sm text-red-700 whitespace-pre-wrap">
                        {testResult.redirect_message}
                      </div>
                    </div>
                  )}

                  {testResult.guidance && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded">
                      <div className="font-semibold text-indigo-900 mb-1">Companion Guidance:</div>
                      <div className="text-sm text-indigo-700">
                        {testResult.guidance.instruction}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}