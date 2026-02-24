import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Medal, 
  Users, 
  MapPin, 
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeaderboardCard({ 
  entry, 
  rank, 
  showRank = true,
  showXP = true,
  showLevel = true,
  compact = false,
  isCurrentUser = false,
  privacySettings = {},
  className 
}) {
  const getRankIcon = (position) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-medium text-slate-600">#{position}</span>;
    }
  };

  const getRankColor = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (position === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    if (position === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
    return 'bg-white border-slate-200';
  };

  const displayName = privacySettings.hideRealName ? 
    entry.displayName || `Student ${rank}` : 
    entry.fullName || entry.displayName;

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md",
          getRankColor(rank),
          isCurrentUser && "ring-2 ring-indigo-500 ring-offset-2",
          className
        )}
      >
        {showRank && getRankIcon(rank)}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">
            {displayName}
          </p>
          {showLevel && entry.level && (
            <p className="text-sm text-slate-600">Level {entry.level}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-indigo-600">{entry.totalXP}</p>
          {showXP && <p className="text-xs text-slate-600">XP</p>}
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-lg cursor-pointer",
        getRankColor(rank),
        isCurrentUser && "ring-2 ring-indigo-500 ring-offset-2",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          {showRank && (
            <div className="flex-shrink-0 w-12 text-center">
              {getRankIcon(rank)}
            </div>
          )}
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {showLevel && entry.level && (
                <Badge variant="secondary" className="text-xs">
                  Level {entry.level}
                </Badge>
              )}
              {entry.locationName && !privacySettings.hideLocation && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {entry.locationName}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-indigo-600">{entry.totalXP}</p>
            <p className="text-sm text-slate-600">Total XP</p>
            {entry.streakDays && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-slate-600">{entry.streakDays} day streak</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        {entry.levelProgress !== undefined && (
          <div className="mt-3">
            <Progress value={entry.levelProgress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Leaderboard({ 
  data = [], 
  title = "Leaderboard",
  type = "global", // global, class, location
  currentUserRank = null,
  isLoading = false,
  showPrivacyToggle = true,
  privacyControls = false,
  className 
}) {
  const [viewMode, setViewMode] = useState('top');
  const [privacySettings, setPrivacySettings] = useState({
    hideRealName: false,
    hideLocation: false,
    showInLeaderboards: true
  });

  const getTypeIcon = () => {
    switch (type) {
      case 'class': return <Users className="w-5 h-5 text-blue-500" />;
      case 'location': return <MapPin className="w-5 h-5 text-green-500" />;
      default: return <Globe className="w-5 h-5 text-purple-500" />;
    }
  };

  const getFilteredData = () => {
    if (viewMode === 'top') {
      return data.slice(0, 10);
    } else if (viewMode === 'nearby' && currentUserRank) {
      const currentIndex = data.findIndex(e => e.id === currentUserRank.id);
      if (currentIndex !== -1) {
        const start = Math.max(0, currentIndex - 2);
        const end = Math.min(data.length, currentIndex + 3);
        return data.slice(start, end);
      }
    }
    return data;
  };

  const displayData = getFilteredData();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon()}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon()}
            {title}
            <Badge variant="secondary">
              {data.length} students
            </Badge>
          </CardTitle>
          
          {showPrivacyToggle && privacyControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPrivacySettings(prev => ({
                  ...prev,
                  hideRealName: !prev.hideRealName
                }))}
              >
                {privacySettings.hideRealName ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
        
        {/* View mode selector */}
        {data.length > 10 && (
          <div className="flex gap-2 mt-2">
            <Button
              variant={viewMode === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('top')}
            >
              <Trophy className="w-4 h-4 mr-1" />
              Top 10
            </Button>
            {currentUserRank && (
              <Button
                variant={viewMode === 'nearby' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('nearby')}
              >
                <Users className="w-4 h-4 mr-1" />
                Near You
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayData.map((entry) => (
            <LeaderboardCard
              key={entry.id}
              entry={entry}
              rank={data.findIndex(e => e.id === entry.id) + 1}
              isCurrentUser={currentUserRank?.id === entry.id}
              privacySettings={privacySettings}
            />
          ))}
        </div>
        
        {/* Current user position if not in display */}
        {currentUserRank && !displayData.find(e => e.id === currentUserRank.id) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <LeaderboardCard
              entry={currentUserRank}
              rank={data.findIndex(e => e.id === currentUserRank.id) + 1}
              isCurrentUser={true}
              privacySettings={privacySettings}
              className="ring-2 ring-indigo-500 ring-offset-2"
            />
          </div>
        )}
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No participants yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LeaderboardTabs({ 
  globalLeaderboard = [],
  classLeaderboard = [],
  locationLeaderboard = [],
  currentUserRank = null,
  className 
}) {
  const [activeTab, setActiveTab] = useState('global');

  const tabs = [
    { id: 'global', label: 'Global', data: globalLeaderboard, icon: Globe },
    { id: 'location', label: 'My Location', data: locationLeaderboard, icon: MapPin },
    { id: 'class', label: 'My Class', data: classLeaderboard, icon: Users }
  ].filter(tab => tab.data.length > 0);

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <Badge variant="secondary">{tab.data.length}</Badge>
          </Button>
        ))}
      </div>

      {/* Active Tab Content */}
      {tabs.map(tab => (
        activeTab === tab.id && (
          <Leaderboard
            key={tab.id}
            data={tab.data}
            title={tab.label}
            type={tab.id}
            currentUserRank={currentUserRank}
          />
        )
      ))}
    </div>
  );
}