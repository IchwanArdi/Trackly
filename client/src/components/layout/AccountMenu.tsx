import { useEffect, useRef } from 'react';
import { User, HelpCircle, LogOut } from 'lucide-react';

interface AccountMenuProps {
    onClose: () => void;
    onLogout: () => void;
}

export function AccountMenu({ onClose, onLogout }: AccountMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking anywhere outside the menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Close on Escape key
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const menuItems = [
        { id: 'account', icon: User, label: 'Account', onClick: onClose },
        { id: 'bantuan', icon: HelpCircle, label: 'Bantuan', onClick: () => { onClose(); window.open('/help', '_blank'); } },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
            <div className="py-1">
                {menuItems.map(({ id, icon: Icon, label, onClick }) => (
                    <button
                        key={id}
                        id={`account-menu-${id}`}
                        onClick={onClick}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition-colors duration-100 hover:bg-surface"
                    >
                        <Icon size={15} className="text-muted" />
                        {label}
                    </button>
                ))}
            </div>
            <div className="border-t border-border py-1">
                <button
                    id="account-menu-logout"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-500 transition-colors duration-100 hover:bg-red-500/10"
                >
                    <LogOut size={15} />
                    Keluar
                </button>
            </div>
        </div>
    );
}