import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; title: string; message?: string };
type Ctx = { push: (t: Omit<Toast, "id">) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3">
        {toasts.map((t) => {
          const Icon =
            t.kind === "success" ? CheckCircle2 : t.kind === "error" ? AlertCircle : Info;
          const tone =
            t.kind === "success"
              ? "text-success"
              : t.kind === "error"
                ? "text-destructive"
                : "text-primary-glow";
          return (
            <div
              key={t.id}
              className="pointer-events-auto w-full max-w-sm rounded-2xl glass shadow-elev px-3 py-2.5 flex items-start gap-2 animate-fade-up"
            >
              <Icon className={tone + " mt-0.5 shrink-0"} size={18} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>
                )}
              </div>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
                className="press text-muted-foreground"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
