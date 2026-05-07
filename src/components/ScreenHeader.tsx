import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, back, right }: ScreenHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/80 px-4 py-3 backdrop-blur-md">
      {back && (
        <button
          type="button"
          onClick={() => window.history.length > 1 ? window.history.back() : navigate({ to: "/home" })}
          aria-label="Voltar"
          className="press flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}
