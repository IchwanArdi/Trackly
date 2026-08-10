import { useEffect, useRef, useState } from 'react';
import { User, HelpCircle, LogOut } from 'lucide-react';
import { AccountPage } from '../../pages/AccountPage';

interface AccountMenuProps {
  onClose: () => void;
  onLogout: () => void;
}

export function AccountMenu({ onClose, onLogout }: AccountMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // State to manage the visibility of the account page modal
  const [showAccountPage, setShowAccountPage] = useState(false);

  useEffect(() => {
    if (showAccountPage) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'; // Restore scrolling
    }
    return () => {
      document.body.style.overflow = 'unset'; // Restore scrolling on unmount
    };
  }, [showAccountPage]);

  // Function to handle the click on the "Account" menu item
  const handleAccountClick = () => {
    setShowAccountPage(true);
  };

  // Close the account menu when clicking outside, but keep the modal open if it is visible.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideMenu = menuRef.current?.contains(target);
      const clickedInsideModal = document.querySelector('[role="dialog"]')?.contains(target);

      if (clickedInsideMenu || clickedInsideModal) {
        return;
      }

      if (showAccountPage) {
        setShowAccountPage(false);
        return;
      }

      onClose();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, showAccountPage]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      if (showAccountPage) {
        setShowAccountPage(false);
        return;
      }

      onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showAccountPage]);

  const menuItems = [
    { id: 'account', icon: User, label: 'Account', onClick: () => handleAccountClick() },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help',
      onClick: () => {
        onClose();
        window.open('/help', '_blank');
      },
    },
  ];

  return (
    <>
      <div ref={menuRef} className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="py-1">
          {menuItems.map(({ id, icon: Icon, label, onClick }) => (
            <button key={id} id={`account-menu-${id}`} onClick={onClick} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition-colors duration-100 hover:bg-surface">
              <Icon size={15} className="text-muted" />
              {label}
            </button>
          ))}
        </div>

        <div className="border-t border-border py-1">
          <button id="account-menu-logout" onClick={onLogout} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-500 transition-colors duration-100 hover:bg-red-500/10">
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </div>

      {showAccountPage && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm" role="presentation" onClick={() => setShowAccountPage(false)}>
          <div role="dialog" aria-modal="true" aria-label="Account modal" onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <AccountPage onClose={() => setShowAccountPage(false)} />
          </div>
        </div>
      )}
    </>
  );
}
