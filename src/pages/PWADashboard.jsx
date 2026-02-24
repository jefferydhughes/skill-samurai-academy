import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OfflineLessonManager from '@/components/pwa/OfflineLessonManager';
import NotificationManager from '@/components/pwa/NotificationManager';
import MobileAppOptimizer from '@/components/pwa/MobileAppOptimizer';
import { 
  Download, 
  Bell, 
  Smartphone
} from 'lucide-react';

const PWADashboard = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PWA Features</h1>
        <p className="text-gray-600">
          Progressive Web App features to enhance your mobile learning experience
        </p>
      </div>

      <Tabs defaultValue="offline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Offline Learning
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offline">
          <OfflineLessonManager />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationManager />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileAppOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWADashboard;