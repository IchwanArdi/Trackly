interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 md:hidden bg-card/95 backdrop-blur-sm border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2.5 px-4 h-12">
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
          <img src="/trackly-icon.webp" alt="Trackly Icon" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">{title ?? 'Trackly'}</span>
      </div>
    </header>
  );
}
