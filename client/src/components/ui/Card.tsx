import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-5 ${onClick ? 'cursor-pointer hover:border-accent/50 transition-colors duration-150' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
