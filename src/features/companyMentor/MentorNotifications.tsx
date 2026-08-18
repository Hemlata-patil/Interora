import React, { useMemo } from 'react';
import { PageHeader, Card } from '@/components';
import { Bell, CheckCircle2, Clock, AlertCircle, FileCheck } from 'lucide-react';
import { 
  mockCompanyNotifications, 
  mockCompanyApplications, 
  mockFacultyStudents, 
  mockCompanyInternships,
  MOCK_CURRENT_MENTOR_ID
} from '../faculty/mockData';

export const MentorNotifications: React.FC = () => {
  // Compute assigned students for this mentor
  const assignedStudentIds = useMemo(() => {
    const selectedApps = mockCompanyApplications.filter(a => a.applicationStatus === 'Selected');
    const ids = selectedApps.map(app => {
      const internship = mockCompanyInternships.find(i => i.id === app.internshipId);
      if (internship && internship.mentorId === MOCK_CURRENT_MENTOR_ID) {
        return app.studentId;
      }
      return null;
    }).filter(Boolean) as string[];
    return new Set(ids);
  }, []);

  const mentorNotifications = useMemo(() => {
    // Filter notifications to only those relevant to the assigned students or internship
    // We mock this by checking if the notification title or message contains 'task' or 'milestone' 
    // AND if it somehow relates to the mentor's domain.
    // Since notifications don't strictly have a studentId right now, we'll just show task/milestone notifications.
    return mockCompanyNotifications.filter(n => 
      ['tasks', 'milestones', 'evaluations', 'interns'].includes(n.category)
    );
  }, [assignedStudentIds]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'task_submitted': return <FileCheck className="w-5 h-5 text-indigo-500" />;
      case 'milestone_completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'task_overdue': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <PageHeader
        title="Notifications"
        description="Recent updates regarding your assigned students."
      />

      <Card className="shadow-sm p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {mentorNotifications.length > 0 ? (
            mentorNotifications.map(notification => (
              <div key={notification.id} className={`p-4 md:p-5 hover:bg-slate-50 transition-colors flex items-start gap-4 ${!notification.read ? 'bg-indigo-50/30' : ''}`}>
                <div className={`mt-1 shrink-0 p-2 rounded-full ${!notification.read ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-1">
                    <h4 className={`text-sm md:text-base font-semibold ${!notification.read ? 'text-indigo-900' : 'text-slate-900'}`}>
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
