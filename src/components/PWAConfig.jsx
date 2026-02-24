import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Wifi, WifiOff, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

const PWAConfig = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInstalling, setUpdateInstalling] = useState(false);
  const [pwaSupported, setPwaSupported] = useState(true);
  const [installProgress, setInstallProgress] = useState(0);

  useEffect(() => {
    // Check if PWA is supported
    if (!('serviceWorker' in navigator) && !('beforeinstallprompt' in window)) {
      setPwaSupported(false);
      return;
    }

    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator.standalone === true);
      const isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);
      
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome);
    };

    // Network status monitoring
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallProgress(100);
    };

    // Listen for service worker updates
    const handleSWUpdate = (event) => {
      setUpdateAvailable(true);
    };

    // Initial checks
    checkInstalled();
    updateNetworkStatus();

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for service worker controller changes
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallProgress(25);
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      setInstallProgress(50);
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      setInstallProgress(75);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
      setInstallProgress(0);
    }
  };

  const handleUpdateClick = async () => {
    setUpdateInstalling(true);
    try {
      // Reload the page to activate the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Error updating app:', error);
      setUpdateInstalling(false);
    }
  };

  const NetworkStatusBadge = () => (
    <Badge variant={networkStatus === 'online' ? 'default' : 'destructive'} className="flex items-center gap-1">
      {networkStatus === 'online' ? (
        <>
          <Wifi className="h-3 w-3" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  );

  if (!pwaSupported) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            PWA Not Supported
          </CardTitle>
          <CardDescription>
            Progressive Web App features are not supported in this browser. Try using a modern browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Update Available Banner */}
      {updateAvailable && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    App Update Available
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    A new version of the app is ready to install
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleUpdateClick}
                disabled={updateInstalling}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateInstalling ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Update Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PWA Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Progressive Web App
            </CardTitle>
            <div className="flex items-center gap-2">
              <NetworkStatusBadge />
              {isInstalled && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Installed
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            {isInstalled 
              ? 'App is installed and ready for offline use'
              : 'Install this app for a better experience with offline support'
            }
          </CardDescription>
        </CardHeader>
        
        {!isInstalled && (
          <CardContent className="space-y-4">
            {deferredPrompt ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleInstallClick}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Get offline access and push notifications
                  </span>
                </div>
                
                {installProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Installation Progress</span>
                      <span>{installProgress}%</span>
                    </div>
                    <Progress value={installProgress} className="h-2" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Install not available</p>
                  <p className="text-xs text-muted-foreground">
                    Try accessing this app in a supported browser (Chrome, Safari, Firefox)
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Offline Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Fast Loading</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Push Notifications</span>
              </div>
            </div>
          </CardContent>
        )}

        {isInstalled && (
          <CardContent>
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">App successfully installed!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You can now use this app offline and receive push notifications.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default PWAConfig;