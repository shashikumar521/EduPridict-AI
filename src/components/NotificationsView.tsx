import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Sparkles,
  Trash2,
  Check
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'alert' | 'deadline' | 'milestone' | 'info';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
}

export const NotificationsView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'alert' | 'deadline' | 'milestone'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'alert',
      title: 'Attendance Alert: Shortfall Detected',
      description: 'Marcus Vance (STD-88429) attendance dipped to 58.4%, falling below the 75% mandatory threshold.',
      timestamp: '15 mins ago',
      read: false,
      actionLabel: 'Review Student'
    },
    {
      id: 'notif-2',
      type: 'deadline',
      title: 'Upcoming Midterm Assessment in 5 Days',
      description: 'CS-204 Data Structures continuous internal assessment 2 is due on Friday.',
      timestamp: '2 hours ago',
      read: false,
      actionLabel: 'View Study Plan'
    },
    {
      id: 'notif-3',
      type: 'milestone',
      title: 'Study Streak Milestone Achieved',
      description: 'You completed 7 consecutive days of logged study sessions! "Study Streak Champion" badge unlocked.',
      timestamp: 'Yesterday',
      read: true
    },
    {
      id: 'notif-4',
      type: 'info',
      title: 'New Recommended Course Available',
      description: 'A verified open course "CS50x: Introduction to Computer Science" has been added to your recommendations.',
      timestamp: '2 days ago',
      read: true,
      actionLabel: 'Explore Course'
    },
    {
      id: 'notif-5',
      type: 'alert',
      title: 'Model Retraining Check Completed',
      description: 'Supervised Random Forest v2.4 pipeline verified with 92.6% Recall on student test split.',
      timestamp: '3 days ago',
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter(
    (n) => filter === 'all' || n.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#131926] rounded-2xl p-6 border border-[#E1E6EF] dark:border-[#1E2B42] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEE7FF] dark:bg-[rgba(112,0,232,0.18)] text-[#7000E8] dark:text-[#C4B5FD] border border-[#D1B8FC] dark:border-[rgba(142,48,255,0.35)]">
              Alert Stream
            </span>
            <span className="text-xs text-[#526078] dark:text-slate-400 font-semibold">Timely Academic Triggers</span>
          </div>
          <h2 className="text-2xl font-black text-[#172033] dark:text-white mt-1 tracking-tight">
            Notifications &amp; Academic Alerts
          </h2>
          <p className="text-sm text-[#526078] dark:text-slate-300 mt-1 max-w-2xl font-medium">
            Stay informed on critical attendance shortfalls, upcoming exam deadlines, and study goal milestones.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn-secondary text-xs px-3.5 py-2 gap-1.5"
            >
              <Check className="w-4 h-4 text-[#7000E8] dark:text-[#C4B5FD]" />
              <span>Mark all as read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="p-2 rounded-xl border border-[#E1E6EF] dark:border-[#1E2B42] text-slate-500 hover:text-[#B42318] dark:text-slate-400 dark:hover:text-rose-400 hover:bg-[#FEECEC] dark:hover:bg-[#182236] transition cursor-pointer"
              title="Clear all notifications"
              aria-label="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-[#131926] rounded-xl p-4 border border-[#E1E6EF] dark:border-[#1E2B42] shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'alert', 'deadline', 'milestone'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                filter === tab
                  ? 'bg-[#7000E8] text-white shadow-xs'
                  : 'text-[#526078] dark:text-slate-300 hover:bg-[#F0F3F9] dark:hover:bg-[#182236]'
              }`}
            >
              {tab === 'all' ? 'All Alerts' : tab}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-[#526078] dark:text-slate-400">
          Unread: <strong className="text-[#7000E8] dark:text-[#C4B5FD] font-bold">{unreadCount}</strong> alerts
        </span>
      </div>

      {/* Notification Stream */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <Bell className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No notifications in this filter</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              All caught up! Alerts will populate as academic events occur.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isAlert = item.type === 'alert';
            const isDeadline = item.type === 'deadline';
            const isMilestone = item.type === 'milestone';

            const iconClass = isAlert
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
              : isDeadline
              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300'
              : isMilestone
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300'
              : 'bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300';

            return (
              <div
                key={item.id}
                onClick={() => markSingleRead(item.id)}
                className={`bg-white dark:bg-[#111827] rounded-xl p-4 border transition flex items-start gap-3.5 shadow-xs cursor-pointer ${
                  !item.read
                    ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
                >
                  {isAlert ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isDeadline ? (
                    <Calendar className="w-4 h-4" />
                  ) : isMilestone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold truncate ${
                        !item.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 inline-block"></span>
                    )}
                    {item.actionLabel && (
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline">
                        {item.actionLabel} →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
