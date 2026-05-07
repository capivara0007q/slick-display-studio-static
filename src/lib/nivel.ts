export type Nivel = "bronze" | "prata" | "ouro";

export function calcNivel(cuponsUsados: number): Nivel {
  if (cuponsUsados >= 15) return "ouro";
  if (cuponsUsados >= 5) return "prata";
  return "bronze";
}

export const NIVEL_INFO: Record<Nivel, { label: string; gradient: string; ring: string; min: number; next: number | null }> = {
  bronze: {
    label: "Bronze",
    gradient: "from-amber-700 via-amber-600 to-orange-700",
    ring: "ring-amber-700/40",
    min: 0,
    next: 5,
  },
  prata: {
    label: "Prata",
    gradient: "from-slate-400 via-slate-300 to-slate-500",
    ring: "ring-slate-400/40",
    min: 5,
    next: 15,
  },
  ouro: {
    label: "Ouro",
    gradient: "from-yellow-400 via-amber-300 to-yellow-500",
    ring: "ring-yellow-400/50",
    min: 15,
    next: null,
  },
};

// Conquistas / badges
export type Conquista = {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  /** Returns true when unlocked */
  test: (ctx: { usados: number; favoritos: number; economia: number }) => boolean;
};

export const CONQUISTAS: Conquista[] = [
  {
    id: "primeiro",
    emoji: "🎯",
    label: "Primeiro cupom",
    desc: "Usou seu primeiro cupom",
    test: (c) => c.usados >= 1,
  },
  {
    id: "cinco",
    emoji: "🔥",
    label: "Em chamas",
    desc: "Usou 5 cupons",
    test: (c) => c.usados >= 5,
  },
  {
    id: "dez",
    emoji: "💎",
    label: "Caçador de ofertas",
    desc: "Usou 10 cupons",
    test: (c) => c.usados >= 10,
  },
  {
    id: "vinte",
    emoji: "👑",
    label: "Lenda",
    desc: "Usou 20 cupons",
    test: (c) => c.usados >= 20,
  },
  {
    id: "favoritos",
    emoji: "❤️",
    label: "Coleção",
    desc: "Marcou 5 favoritos",
    test: (c) => c.favoritos >= 5,
  },
  {
    id: "economista",
    emoji: "💰",
    label: "Economista",
    desc: "Economizou R$ 100",
    test: (c) => c.economia >= 100,
  },
  {
    id: "rico",
    emoji: "🤑",
    label: "Mestre da economia",
    desc: "Economizou R$ 500",
    test: (c) => c.economia >= 500,
  },
];
