import React, { useState, useEffect } from 'react';
import { usePWA } from '@/lib/PWAContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  CheckCircle, 
  Clock, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';

const OfflineLessonManager = () => {
  const { 
    isOnline, 
    cacheLesson, 
    getCachedLessons, 
    syncOfflineData,
    saveOfflineData 
  } = usePWA();
  
  const [cachedLessons, setCachedLessons] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [storageUsage, setStorageUsage] = useState(0);

  useEffect(() => {
    loadCachedLessons();
    updateStorageUsage();
  }, []);

  const loadCachedLessons = async () => {
    const lessons = await getCachedLessons();
    setCachedLessons(lessons);
  };

  const updateStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      setStorageUsage((used / quota) * 100);
    }
  };

  const downloadLesson = async (lessonId, lessonData) => {
    setDownloadProgress(prev => ({
      ...prev,
      [lessonId]: 0
    }));

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[lessonId] || 0;
        if (current >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return {
          ...prev,
          [lessonId]: current + 10
        };
      });
    }, 200);

    try {
      // Cache lesson content
      await cacheLesson(lessonData);
      
      // Download additional assets (videos, images, etc.)
      if (lessonData.videos) {
        for (const video of lessonData.videos) {
          const response = await fetch(video.url);
          const blob = await response.blob();
          // Cache video blob
        }
      }

      if (lessonData.images) {
        for (const image of lessonData.images) {
          const response = await fetch(image.url);
          const blob = await response.blob();
          // Cache image blob
        }
      }

      clearInterval(progressInterval);
      setDownloadProgress(prev => ({
        ...prev,
        [lessonId]: 100
      }));

      // Save download metadata offline
      await saveOfflineData({
        type: 'lesson_download',
        lessonId,
        timestamp: new Date().toISOString()
      });

      setTimeout(() => {
        setDownloadProgress(prev => {
          const { [lessonId]: removed, ...rest } = prev;
          return rest;
        });
        loadCachedLessons();
        updateStorageUsage();
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Failed to download lesson:', error);
      
      setDownloadProgress(prev => {
        const { [lessonId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const removeCachedLesson = async (lessonId) => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['lessons'], 'readwrite');
      const store = transaction.objectStore('lessons');
      await store.delete(lessonId);
      
      await loadCachedLessons();
      updateStorageUsage();
    } catch (error) {
      console.error('Failed to remove cached lesson:', error);
    }
  };

  const openOfflineDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SkillSamuraiOffline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  // Mock lesson data for demonstration
  const availableLessons = [
    {
      id: 'intro-to-python',
      title: 'Introduction to Python',
      description: 'Learn the basics of Python programming',
      duration: '45 min',
      difficulty: 'Beginner',
      size: '125 MB',
      hasVideo: true,
      hasQuiz: true
    },
    {
      id: 'web-dev-basics',
      title: 'Web Development Basics',
      description: 'HTML, CSS, and JavaScript fundamentals',
      duration: '60 min',
      difficulty: 'Beginner',
      size: '89 MB',
      hasVideo: true,
      hasQuiz: true
    },
    {
      id: 'react-components',
      title: 'React Components',
      description: 'Building reusable UI components with React',
      duration: '90 min',
      difficulty: 'Intermediate',
      size: '156 MB',
      hasVideo: true,
      hasQuiz: true
    }
  ];

  const isLessonCached = (lessonId) => {
    return cachedLessons.some(lesson => lesson.id === lessonId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offline Learning</h2>
          <p className="text-gray-600">Download lessons to learn without internet</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Storage Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Offline Content</span>
              <span>{Math.round(storageUsage)}%</span>
            </div>
            <Progress value={storageUsage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{cachedLessons.length} lessons cached</span>
              <span>Manage storage</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Lessons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available for Download</h3>
        <div className="grid gap-4">
          {availableLessons.map((lesson) => {
            const isCached = isLessonCached(lesson.id);
            const isDownloading = downloadProgress[lesson.id] !== undefined;

            return (
              <Card key={lesson.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold">{lesson.title}</h4>
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                        <span>•</span>
                        <span>{lesson.difficulty}</span>
                        <span>•</span>
                        <span>{lesson.size}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {lesson.hasVideo && <Badge variant="secondary">Video</Badge>}
                        {lesson.hasQuiz && <Badge variant="secondary">Quiz</Badge>}
                        {isCached && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Downloaded
                          </Badge>
                        )}
                      </div>

                      {isDownloading && (
                        <div className="mt-2">
                          <Progress value={downloadProgress[lesson.id]} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            Downloading... {downloadProgress[lesson.id]}%
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {isCached ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCachedLesson(lesson.id)}
                          disabled={!isOnline}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant={isOnline ? "default" : "secondary"}
                          size="sm"
                          onClick={() => downloadLesson(lesson.id, lesson)}
                          disabled={!isOnline || isDownloading}
                        >
                          {isDownloading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {!isOnline && !isCached && (
                    <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <WifiOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Requires internet connection</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Offline Tips */}
      {!isOnline && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Offline Mode</h4>
                <p className="text-sm text-blue-600 mt-1">
                  You can still access downloaded lessons. Your progress will sync automatically when you're back online.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfflineLessonManager;