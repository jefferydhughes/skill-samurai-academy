import React, { useState, useEffect } from 'react';
import { usePWA } from '@/lib/PWAContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Trophy, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

const NotificationManager = () => {
  const { 
    notificationPermission,
    requestNotificationPermission,
    showNotification,
    scheduleNotification
  } = usePWA();

  const [notificationSettings, setNotificationSettings] = useState({
    classReminders: true,
    achievementAlerts: true,
    streakMilestones: true,
    scheduleChanges: true,
    newContent: true,
    systemUpdates: false
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('15');

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setNotificationSettings(JSON.parse(saved));
    }
    
    const savedSound = localStorage.getItem('notificationSound');
    if (savedSound !== null) {
      setSoundEnabled(JSON.parse(savedSound));
    }
    
    const savedTime = localStorage.getItem('reminderTime');
    if (savedTime) {
      setReminderTime(savedTime);
    }
  };

  const updateNotificationSetting = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const testNotification = (type) => {
    const testNotifications = {
      classReminder: {
        title: 'Class Starting Soon',
        body: 'Python Basics starts in 15 minutes',
        icon: '/icon-192x192.png',
        tag: 'class-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'join-class',
            title: 'Join Now'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      },
      achievement: {
        title: 'Achievement Unlocked!',
        body: 'You completed your first Python lesson',
        icon: '/icon-192x192.png',
        tag: 'achievement',
        requireInteraction: false
      },
      streak: {
        title: 'Streak Milestone! 🔥',
        body: 'You\'ve maintained a 7-day learning streak',
        icon: '/icon-192x192.png',
        tag: 'streak',
        requireInteraction: false
      },
      scheduleChange: {
        title: 'Schedule Updated',
        body: 'Your Wednesday class has been moved to 3:00 PM',
        icon: '/icon-192x192.png',
        tag: 'schedule-change',
        requireInteraction: true
      }
    };

    const config = testNotifications[type];
    if (config) {
      showNotification(config.title, config);
      
      if (soundEnabled) {
        playNotificationSound();
      }
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Audio play failed, likely due to browser policy
      console.log('Could not play notification sound');
    });
  };

  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      showNotification('Notifications Enabled!', {
        body: 'You\'ll now receive learning updates and reminders',
        icon: '/icon-192x192.png'
      });
    }
  };

  const scheduleTestNotifications = () => {
    // Schedule test notifications for demonstration
    scheduleNotification('Test Class Reminder', {
      body: 'Your test class starts in 15 minutes'
    }, 5000);

    scheduleNotification('Test Achievement', {
      body: 'You\'ve unlocked a test achievement!'
    }, 10000);
  };

  if (notificationPermission !== 'granted') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Enable Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Stay updated with your learning progress and never miss a class with push notifications.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Class reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Achievement notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Streak milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Schedule changes</span>
              </div>
            </div>
          </div>
          
          <Button onClick={requestPermission} className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notifications</h2>
        <p className="text-gray-600">Manage your learning notifications and reminders</p>
      </div>

      {/* Notification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              <span>Push notifications enabled</span>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Class Reminders
                </Label>
                <p className="text-sm text-gray-500">
                  Get notified {reminderTime} minutes before class starts
                </p>
              </div>
              <Switch
                checked={notificationSettings.classReminders}
                onCheckedChange={(checked) => 
                  updateNotificationSetting('classReminders', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Achievement Alerts
                </Label>
                <p className="text-sm text-gray-500">
                  Celebrate your learning milestones
                </p>
              </div>
              <Switch
                checked={notificationSettings.achievementAlerts}
                onCheckedChange={(checked) => 
                  updateNotificationSetting('achievementAlerts', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Streak Milestones
                </Label>
                <p className="text-sm text-gray-500">
                  Get notified about your learning streaks
                </p>
              </div>
              <Switch
                checked={notificationSettings.streakMilestones}
                onCheckedChange={(checked) => 
                  updateNotificationSetting('streakMilestones', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Changes
                </Label>
                <p className="text-sm text-gray-500">
                  Important updates to your class schedule
                </p>
              </div>
              <Switch
                checked={notificationSettings.scheduleChanges}
                onCheckedChange={(checked) => 
                  updateNotificationSetting('scheduleChanges', checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sound Effects</Label>
              <p className="text-sm text-gray-500">
                Play sound with notifications
              </p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={(checked) => {
                setSoundEnabled(checked);
                localStorage.setItem('notificationSound', JSON.stringify(checked));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <select
              value={reminderTime}
              onChange={(e) => {
                setReminderTime(e.target.value);
                localStorage.setItem('reminderTime', e.target.value);
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="5">5 minutes before</option>
              <option value="10">10 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Test how notifications will appear on your device
          </p>
          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => testNotification('classReminder')}
              className="justify-start"
            >
              <Clock className="w-4 h-4 mr-2" />
              Test Class Reminder
            </Button>
            <Button
              variant="outline"
              onClick={() => testNotification('achievement')}
              className="justify-start"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Test Achievement
            </Button>
            <Button
              variant="outline"
              onClick={() => testNotification('streak')}
              className="justify-start"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Test Streak Milestone
            </Button>
            <Button
              variant="outline"
              onClick={() => testNotification('scheduleChange')}
              className="justify-start"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Test Schedule Change
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManager;