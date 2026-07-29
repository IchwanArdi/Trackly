interface StreakCounterProps {
  current: number;
  longest: number;
}

export function StreakCounter({ current, longest }: StreakCounterProps) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-3xl font-bold text-foreground tabular-nums">{current}</span>
        <span className="text-xs text-muted">Current streak</span>
      </div>
      <div className="w-px bg-border" />
      <div className="flex flex-col gap-0.5">
        <span className="text-3xl font-bold text-foreground tabular-nums">{longest}</span>
        <span className="text-xs text-muted">Longest streak</span>
      </div>
    </div>
  );
}
