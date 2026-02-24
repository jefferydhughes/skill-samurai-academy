import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { differenceInYears } from 'date-fns';

export default function AgeRecommendationBar({ onAgeChange, currentAge, onClear }) {
  const [dob, setDob] = useState('');

  const handleDobChange = (value) => {
    setDob(value);
    if (value) {
      const age = differenceInYears(new Date(), new Date(value));
      if (age > 0 && age < 100) {
        onAgeChange(age);
      }
    } else {
      onClear();
    }
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div className="flex-1">
            <Label className="text-sm font-semibold text-slate-900">
              Find Camps Perfect for Your Child
            </Label>
            <p className="text-xs text-slate-600 mt-1">
              Enter their date of birth to see recommended camps
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={dob}
              onChange={(e) => handleDobChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-40"
            />
            {currentAge && (
              <>
                <div className="text-sm">
                  <span className="font-semibold text-indigo-600">Age {currentAge}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDob('');
                    onClear();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}