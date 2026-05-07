import type { ReactNode } from "react";

/**
 * PhoneFrame
 * - Mobile real (≤768px): app ocupa a tela inteira (estilo nativo).
 * - Desktop: mostra um frame de iPhone para preview/demo do app.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background md:flex md:items-center md:justify-center md:bg-[oklch(0.10_0.005_30)] md:p-6">
      {/* Desktop frame */}
      <div
        className="
          relative flex h-screen w-screen flex-col overflow-hidden bg-background
          md:h-[852px] md:w-[393px]
          md:rounded-[52px] md:border-[10px] md:border-[#0a0a0a]
          md:shadow-[0_50px_100px_rgba(0,0,0,.7),inset_0_0_0_2px_#222]
        "
      >
        {/* Notch (apenas desktop) */}
        <div className="hidden md:flex absolute left-1/2 top-2 z-50 h-7 w-32 -translate-x-1/2 items-center justify-center rounded-full bg-black">
          <div className="h-2 w-2 rounded-full bg-[oklch(0.25_0.01_30)]" />
        </div>

        {/* Conteúdo do app */}
        <div className="relative flex h-full w-full flex-col overflow-hidden pt-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
