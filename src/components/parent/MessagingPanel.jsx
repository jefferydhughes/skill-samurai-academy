import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Loader2, Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function MessagingPanel({ isOpen, onClose, user }) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: async () => {
      // TODO: Replace with actual Message entity when created
      return [];
    },
    enabled: !!user?.email,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      // Send email to support/instructors
      await api.integrations.Core.SendEmail({
        to: 'support@skillsamurai.com', // Replace with actual instructor email
        from_name: user?.full_name || 'Parent',
        subject: data.subject || 'Message from Parent',
        body: `
From: ${user?.full_name} (${user?.email})

${data.message}
        `.trim()
      });

      // TODO: Also create a Message entity record when entity is created
      return { success: true };
    },
    onSuccess: () => {
      setMessage('');
      setSubject('');
      alert('Message sent successfully! We\'ll get back to you soon.');
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ subject, message });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Messages</h2>
                  <p className="text-indigo-100 text-sm">Chat with instructors or support</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="send" className="flex-1">
            <TabsList className="w-full bg-slate-100 rounded-none">
              <TabsTrigger value="send" className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="h-40 bg-white resize-none"
                />
                <p className="text-xs text-slate-500">
                  Our team typically responds within 24 hours
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => { setMessage(''); setSubject(''); }}>
                  Clear
                </Button>
              </div>

              {/* Quick Contact Options */}
              <div className="pt-4 border-t space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject('Question about my child\'s progress');
                      setMessage('Hi, I have a question about ');
                    }}
                    className="justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Ask about progress
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject('Schedule change request');
                      setMessage('I would like to request a schedule change for ');
                    }}
                    className="justify-start"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Schedule change
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <ScrollArea className="h-96">
                {isLoading ? (
                  <div className="text-center py-12 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Your message history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-slate-900">{msg.subject}</div>
                          <Badge variant={msg.status === 'replied' ? 'default' : 'secondary'}>
                            {msg.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{msg.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {format(new Date(msg.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}