import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CompanionSelector from '@/components/companion/CompanionSelector';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanionSetup() {
  const [user, setUser] = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
      
      // Load existing companion preference if exists
      if (userData.companionType) {
        setSelectedCompanion(userData.companionType);
      }
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const handleSave = async () => {
    if (!selectedCompanion) {
      toast.error('Please select a companion first!');
      return;
    }

    try {
      await api.auth.updateMe({
        companionType: selectedCompanion
      });
      
      toast.success('Companion saved! Ready to start coding!');
      navigate(createPageUrl('LearningWorlds'));
    } catch (e) {
      toast.error('Failed to save companion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(createPageUrl('LearningWorlds'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <CompanionSelector 
          onSelect={setSelectedCompanion}
          currentCompanion={selectedCompanion}
        />

        <div className="mt-8 text-center">
          <Button
            onClick={handleSave}
            disabled={!selectedCompanion}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
          >
            {user?.companionType ? 'Update Companion' : 'Start Coding with My Companion'}
          </Button>
        </div>

        <Card className="mt-8 border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-indigo-900 mb-2">What's a Coding Companion?</h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Your companion is here to help you learn! They'll answer questions, give hints (not solutions!), 
              and help you think through coding challenges. You can ask them anything about your code or 
              try new ideas together. Don't worry—you can always change your companion later!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}