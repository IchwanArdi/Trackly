import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../store/notificationStore';

function timeAgo(dateString: string) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}j lalu`;
    return `${Math.floor(diffHours / 24)}h lalu`;
}

export function NotificationBell() {
    const { notifications, unreadCount, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next && unreadCount > 0) {
            markAllRead();
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                id="btn-notification-bell"
                onClick={handleToggle}
                className="relative flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-[9px] font-semibold text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 bottom-full mb-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-border">
                        <p className="text-xs font-semibold text-foreground">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                        {notifications.length === 0 ? (
                            <p className="px-3.5 py-6 text-xs text-muted text-center">Belum ada notifikasi</p>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`px-3.5 py-2.5 ${!n.isRead ? 'bg-accent/5' : ''}`}>
                                    <p className="text-xs font-medium text-foreground">{n.title}</p>
                                    <p className="text-[11px] text-muted mt-0.5">{n.message}</p>
                                    <p className="text-[10px] text-muted/70 mt-1">{timeAgo(n.createdAt)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}