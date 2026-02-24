import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePWA } from '@/lib/PWAContext';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  RefreshCw, 
  Smartphone, 
  CloudDownload,
  Check,
  AlertCircle
} from 'lucide-react';

const PWAControls = () => {
  const { 
    isOnline, 
    isInstallable, 
    isInstalled, 
    waitingWorker, 
    notificationPermission,
    installApp,
    skipWaiting,
    requestNotificationPermission,
    syncOfflineData,
    showNotification
  } = usePWA();

  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(notificationPermission === 'granted');

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallDialog(false);
      showNotification('App Installed!', {
        body: 'Skill Samurai is now installed on your device',
        icon: '/icon-192x192.png'
      });
    }
  };

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      // Notifications are already enabled
      setNotificationsEnabled(false);
    } else {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        showNotification('Notifications Enabled!', {
          body: 'You\'ll receive updates about your learning progress',
          icon: '/icon-192x192.png'
        });
      }
    }
    setShowNotificationDialog(false);
  };

  const handleSync = async () => {
    const success = await syncOfflineData();
    if (success) {
      showNotification('Sync Complete', {
        body: 'Your offline progress has been synced',
        icon: '/icon-192x192.png'
      });
    }
  };

  return (
    <>
      {/* Status Bar */}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Update Available */}
        {waitingWorker && (
          <Button
            onClick={skipWaiting}
            size="sm"
            variant="outline"
            className="bg-green-50 border-green-200 hover:bg-green-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Available
          </Button>
        )}

        {/* Install Prompt */}
        {isInstallable && !isInstalled && (
          <Button
            onClick={() => setShowInstallDialog(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
        )}

        {/* Notification Settings */}
        <Button
          onClick={() => setShowNotificationDialog(true)}
          size="sm"
          variant="outline"
        >
          {notificationPermission === 'granted' ? (
            <Bell className="w-4 h-4 mr-2" />
          ) : (
            <BellOff className="w-4 h-4 mr-2" />
          )}
          Notifications
        </Button>

        {/* Offline Sync */}
        {!isOnline && (
          <Button
            onClick={handleSync}
            size="sm"
            variant="outline"
            disabled={isOnline}
          >
            <CloudDownload className="w-4 h-4 mr-2" />
            Sync When Online
          </Button>
        )}
      </div>

      {/* Install Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Install Skill Samurai
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Why install?</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Works offline - learn without internet</li>
                <li>• Faster loading and better performance</li>
                <li>• Native app experience</li>
                <li>• Push notifications for class reminders</li>
                <li>• Appears on your home screen</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInstall} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Install Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowInstallDialog(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Get reminders for classes, achievements, and updates
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h5 className="font-medium mb-2">You'll receive:</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  Class reminders
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  Achievement unlocks
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  Streak milestones
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  Schedule changes
                </li>
              </ul>
            </div>

            {notificationPermission === 'denied' && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Notifications blocked
                      </p>
                      <p className="text-xs text-orange-600">
                        Enable notifications in your browser settings to receive updates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={() => setShowNotificationDialog(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PWAControls;