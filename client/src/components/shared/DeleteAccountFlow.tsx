import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useData } from '../../store/dataStore';

const CONFIRM_TEXT = 'delete permanent account';

interface DeleteAccountSectionProps {
    onDeleted?: () => void;
    variant?: 'card' | 'inline';
}

export default function DeleteAccountSection({ onDeleted, variant = 'card' }: DeleteAccountSectionProps) {
    const { deleteUser } = useData();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);

        const idToast = toast.loading('Deleting account...');

        try {
            const response = await deleteUser();

            toast.update(idToast, {
                render: response?.message || 'Account successfully deleted',
                type: 'success',
                isLoading: false,
                autoClose: 2000,
            });

            if (!localStorage.getItem('token')) {
                onDeleted?.();
                navigate('/');
            }
        } catch (error: unknown) {
            console.error('Error deleting account:', error);
            toast.dismiss(idToast);
        } finally {
            setIsDeleting(false);
        }
    };

    const resetConfirm = () => {
        setShowConfirm(false);
        setConfirmText('');
    };

    return (
        <div className={variant === 'card' ? 'bg-card border border-border rounded-xl p-4' : ''}>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                This action is permanent. All your data, profile, and application settings will be completely deleted and cannot be recovered.
            </p>

            {!showConfirm ? (
                <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500 hover:text-white transition duration-150 cursor-pointer"
                >
                    <Trash2 size={13} />
                    Delete My Account
                </button>
            ) : (
                <div className="rounded-lg border border-border bg-surface p-3 space-y-3">
                    <p className="text-xs font-medium text-foreground">
                        Type <span className="font-mono bg-card px-1 py-0.5 rounded border border-red-500/30 text-red-500 font-bold select-none">{CONFIRM_TEXT}</span> to confirm:
                    </p>

                    <input
                        type="text"
                        placeholder="Enter confirmation text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        disabled={isDeleting}
                        className="w-full rounded-lg bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none disabled:opacity-50"
                    />

                    <div className="flex items-center gap-2 justify-end">
                        <button
                            type="button"
                            onClick={resetConfirm}
                            disabled={isDeleting}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-card disabled:opacity-50 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={confirmText !== CONFIRM_TEXT || isDeleting}
                            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-500/60 disabled:border-border disabled:bg-transparent disabled:text-muted disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Yes, Delete'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}