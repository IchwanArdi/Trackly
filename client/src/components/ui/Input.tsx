import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          {...props}
          className={`
            w-full px-3 py-2 text-sm bg-surface border rounded-md
            text-foreground placeholder:text-muted
            focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
            transition-colors duration-150
            ${error ? 'border-red-400' : 'border-border'}
            ${className}
          `}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
