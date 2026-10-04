import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, Card, Button } from '@/components';
import { Bell, CheckCircle2, Clock, AlertCircle, FileCheck, Loader2, CheckCheck } from 'lucide-react';
import {
  fetchMentorNotificationsBackend,
  markMentorNotificationReadBackend,
  markAllMentorNotificationsReadBackend,
} from '@/services/api/backendService';

export interface MentorNotificationRecord {
  id: string;
  recipientId: string;
  category: string;
  title: string;
  message: string;
  priority: string;
  actionUrl?: string | null;
  read: boolean;
  createdAt: string;
}

export const MentorNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<MentorNotificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchMentorNotificationsBackend();
      setNotifications(items || []);
    } catch (err: any) {
      console.error('[MentorNotifications] Failed to load notifications:', err);
      setError('Failed to load notifications from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markMentorNotificationReadBackend(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      console.error('[MentorNotifications] Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMentorNotificationsReadBackend();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err: any) {
      console.error('[MentorNotifications] Mark all read error:', err);
    }
  };

  const getIcon = (category: string, title: string) => {
    const combined = `${category} ${title}`.toLowerCase();
    if (combined.includes('task') || combined.includes('submission')) {
      return <FileCheck className="w-5 h-5 text-indigo-500" />;
    }
    if (combined.includes('milestone') || combined.includes('completed')) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
    if (combined.includes('urgent') || combined.includes('overdue') || combined.includes('alert')) {
      return <AlertCircle className="w-5 h-5 text-rose-500" />;
    }
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Notifications"
          description="Recent updates regarding your assigned students."
        />
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          {error}
        </div>
      )}

      <Card className="shadow-sm p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`p-4 md:p-5 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer ${
                  !notification.read ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div
                  className={`mt-1 shrink-0 p-2 rounded-full ${
                    !notification.read ? 'bg-indigo-100' : 'bg-slate-100'
                  }`}
                >
                  {getIcon(notification.category, notification.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-1">
                    <h4
                      className={`text-sm md:text-base font-semibold ${
                        !notification.read ? 'text-indigo-900' : 'text-slate-900'
                      }`}
                    >
                      {notification.title}
                    </h4>
                    <div className="flex items-center text-xs text-slate-500 shrink-0">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">{notification.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-900">No new notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
