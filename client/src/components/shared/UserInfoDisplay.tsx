import { getUser } from "../../utils/auth";
import { Mail, ShieldCheck, User } from "lucide-react";

const getInitials = (name: string | undefined) => {
    if (!name) return 'US';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

export default function UserInfoDisplay() {
    const user = getUser();
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
                <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-sm font-bold text-accent shrink-0">{getInitials(user?.name)}</div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-sm md:text-base font-semibold text-foreground truncate">{user?.name ?? 'User'}</h2>
                    <p className="text-xs text-muted md:text-sm truncate mt-0.5">{user?.email ?? 'user@example.com'}</p>
                </div>
            </div>

            <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-2.5 text-muted">
                        <User size={14} />
                        <span>Name</span>
                    </div>
                    <span className="font-medium text-foreground md:text-sm">{user?.name ?? 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-2.5 text-muted">
                        <Mail size={14} />
                        <span>Email</span>
                    </div>
                    <span className="font-medium text-foreground truncate max-w-45 md:text-sm">{user?.email ?? 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-2.5 text-muted">
                        <ShieldCheck size={14} />
                        <span>Status</span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-500 md:text-sm">Active</span>
                </div>
            </div>
        </div>
    );
}