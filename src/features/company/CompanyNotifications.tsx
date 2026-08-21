import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, Input } from '@/components';
import { 
  Bell, Check, Search, Filter, 
  FileText, CheckSquare, Award, Users, 
  Briefcase, AlertCircle, Clock
} from 'lucide-react';
import { 
  mockCompanyNotifications, 
  setMockCompanyNotifications 
} from '../faculty/mockData';
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

const getCategoryRoute = (category: string, relatedId?: string) => {
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
  
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export const CompanyNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<CompanyNotificationData[]>(mockCompanyNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

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

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    setMockCompanyNotifications(updated);
  };

  const handleMarkAsUnread = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = notifications.map(n => n.id === id ? { ...n, read: false } : n);
    setNotifications(updated);
    setMockCompanyNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setMockCompanyNotifications(updated);
  };

  const handleNotificationClick = (notification: CompanyNotificationData) => {
    if (!notification.read) {
      const updated = notifications.map(n => n.id === notification.id ? { ...n, read: true } : n);
      setNotifications(updated);
      setMockCompanyNotifications(updated);
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
          <select 
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 min-w-[140px]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          
          <button 
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-4 py-2 text-sm rounded-lg border whitespace-nowrap transition-colors ${filterUnreadOnly ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Unread Only
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => {
              const Icon = getCategoryIcon(notif.category);
              const isUnread = !notif.read;
              
              return (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 ${isUnread ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isUnread ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {notif.title}
                        </h4>
                        {notif.priority === 'urgent' && <Badge variant="rose" className="px-1.5 py-0 text-[10px]">Urgent</Badge>}
                        {notif.priority === 'important' && <Badge variant="amber" className="px-1.5 py-0 text-[10px]">Important</Badge>}
                        {isUnread && <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notif.createdAt)}
                      </div>
                    </div>
                    
                    <p className={`text-sm mt-1 ${isUnread ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notif.message}
                    </p>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-xs text-indigo-600 font-medium capitalize flex items-center hover:underline">
                        View Details
                      </span>
                      
                      <button 
                        onClick={(e) => isUnread ? handleMarkAsRead(e, notif.id) : handleMarkAsUnread(e, notif.id)}
                        className="text-xs text-slate-400 hover:text-slate-600 z-10"
                      >
                        {isUnread ? 'Mark as read' : 'Mark as unread'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No notifications found</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              {notifications.length === 0 ? "You're all caught up. New internship activity will appear here." : "No notifications match your current filters. You're all caught up."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
