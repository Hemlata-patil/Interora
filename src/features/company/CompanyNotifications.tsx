import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, Input } from '@/components';
import { 
  Bell, Check, Search, Filter, 
  FileText, CheckSquare, Award, Users, 
  Briefcase, AlertCircle, Clock, Loader2
} from 'lucide-react';
import { 
  fetchCompanyNotificationsBackend,
  markCompanyNotificationReadBackend,
  markCompanyNotificationUnreadBackend,
  markAllCompanyNotificationsReadBackend
} from '@/services/api/backendService';
import { mockCompanyNotifications } from '../faculty/mockData';
import type { 
  CompanyNotificationData,
  NotificationCategory
} from '../faculty/mockData';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'applications': return Users;
    case 'interns': return Briefcase;
    case 'tasks': return CheckSquare;
    case 'milestones': return FileText;
    case 'evaluations': return FileText;
    case 'ppo': return Award;
    case 'certificates': return Award;
    default: return Bell;
  }
};

const getCategoryRoute = (category: string, actionUrl?: string) => {
  if (actionUrl) return actionUrl;
  switch (category) {
    case 'applications': return '/company/applicants';
    case 'interns': return '/company/interns';
    case 'tasks': return '/company/tasks';
    case 'milestones': return '/company/milestones';
    case 'evaluations': return '/company/evaluations';
    case 'ppo': return '/company/ppo';
    case 'certificates': return '/company/certificates';
    default: return '/company';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export const CompanyNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<CompanyNotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendNotifs = await fetchCompanyNotificationsBackend();
      if (backendNotifs && backendNotifs.length > 0) {
        const mapped: CompanyNotificationData[] = backendNotifs.map((n: any) => ({
          id: n.id,
          type: n.category,
          category: n.category as NotificationCategory,
          title: n.title,
          message: n.message,
          priority: n.priority === 'urgent' ? 'urgent' : n.priority === 'high' ? 'important' : 'normal',
          read: n.read,
          createdAt: n.createdAt,
          relatedId: n.actionUrl,
        }));
        setNotifications(mapped);
      } else {
        setNotifications(mockCompanyNotifications);
      }
    } catch (err: any) {
      console.error('[CompanyNotifications] Error loading notifications:', err);
      setError('Failed to load notifications.');
      setNotifications(mockCompanyNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply filters and search
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
      const matchesUnread = !filterUnreadOnly || !n.read;
      
      return matchesSearch && matchesCategory && matchesUnread;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, searchTerm, filterCategory, filterUnreadOnly]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markCompanyNotificationReadBackend(id);
    } catch (err: any) {
      console.warn('[handleMarkAsRead] Backend notice:', err);
    }
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
  };

  const handleMarkAsUnread = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markCompanyNotificationUnreadBackend(id);
    } catch (err: any) {
      console.warn('[handleMarkAsUnread] Backend notice:', err);
    }
    const updated = notifications.map(n => n.id === id ? { ...n, read: false } : n);
    setNotifications(updated);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllCompanyNotificationsReadBackend();
    } catch (err: any) {
      console.warn('[handleMarkAllAsRead] Backend notice:', err);
    }
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const handleNotificationClick = async (notification: CompanyNotificationData) => {
    if (!notification.read) {
      try {
        await markCompanyNotificationReadBackend(notification.id);
      } catch (err: any) {
        console.warn('[handleNotificationClick] Backend notice:', err);
      }
      const updated = notifications.map(n => n.id === notification.id ? { ...n, read: true } : n);
      setNotifications(updated);
    }
    const route = getCategoryRoute(notification.category, notification.relatedId);
    navigate(route);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'applications', label: 'Applications' },
    { value: 'interns', label: 'Interns' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'milestones', label: 'Milestones' },
    { value: 'evaluations', label: 'Evaluations' },
    { value: 'ppo', label: 'PPO & Conversion' },
    { value: 'certificates', label: 'Certificates' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <PageHeader
          title="Notifications"
          description="Stay updated on applications, interns, tasks, evaluations, and other important internship activities."
        />
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} className="md:mt-4 whitespace-nowrap bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200">
            <Check className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-white shadow-sm border border-slate-200 rounded-xl">
          <div className="p-3 bg-slate-100 rounded-lg">
            <Bell className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{notifications.length}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white shadow-sm border border-slate-200 rounded-xl">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Bell className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{unreadCount}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unread</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white shadow-sm border border-slate-200 rounded-xl">
          <div className="p-3 bg-rose-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{urgentCount}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Urgent</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            className="pl-9 bg-white" 
            placeholder="Search notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap cursor-pointer select-none border border-slate-200 px-3 py-2 rounded-lg bg-slate-50">
            <input 
              type="checkbox"
              checked={filterUnreadOnly}
              onChange={(e) => setFilterUnreadOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Unread only
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading notifications...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-white rounded-xl border border-slate-200">{error}</div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => {
            const IconComponent = getCategoryIcon(notification.category);
            
            return (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  notification.read 
                    ? 'bg-white border-slate-200 hover:border-slate-300' 
                    : 'bg-indigo-50/20 border-indigo-100 hover:border-indigo-200 shadow-sm'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  notification.read ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm tracking-tight ${notification.read ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>
                        {notification.title}
                      </h4>
                      {notification.priority === 'urgent' && (
                        <Badge variant="rose" className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider">Urgent</Badge>
                      )}
                      {notification.priority === 'important' && (
                        <Badge variant="amber" className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider">Important</Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100/80 pt-2 mt-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {notification.category}
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {notification.read ? (
                        <button 
                          onClick={(e) => handleMarkAsUnread(e, notification.id)}
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Mark as unread
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No notifications found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              You're all caught up! No notifications matching your current search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
