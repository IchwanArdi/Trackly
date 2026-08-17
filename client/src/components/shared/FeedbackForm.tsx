import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../../store/dataStore';

interface FeedbackFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function FeedbackForm({ onSuccess, className = '' }: FeedbackFormProps) {
    const { sendFeedback } = useData();
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !message) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        const idToast = toast.loading('Sending feedback...');

        try {
            const response = await sendFeedback({ category, message });

            toast.update(idToast, {
                render: response.message || 'Feedback sent successfully',
                type: 'success',
                isLoading: false,
                autoClose: 2000,
            });

            setCategory('');
            setMessage('');
            onSuccess?.();
        } catch (error: unknown) {
            console.error('Error submitting feedback:', error);
            const errMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
            toast.update(idToast, {
                render: errMsg || 'Failed to send feedback. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 2000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className={className}>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 mb-4">
                <ShieldCheck size={14} className="mt-0.5 text-accent shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    This feedback is <span className="font-bold text-foreground">anonymous</span>, we cannot identify the sender, so please feel free to share honestly and openly.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="feedback-category" className="text-xs font-medium text-muted-foreground">
                        Category
                    </label>
                    <select
                        id="feedback-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                    >
                        <option value="">Select category</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Suggestion</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground">
                        Message
                    </label>
                    <textarea
                        id="feedback-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        placeholder="Write your feedback here..."
                        className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        disabled={isSubmitting || !category || message.trim().length < 3}
                        type="submit"
                        className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" /> Processing...
                            </>
                        ) : (
                            'Submit Feedback'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}