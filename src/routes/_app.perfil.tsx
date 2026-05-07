import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LogOut, IdCard, Phone, Mail, MapPin, Calendar, ShieldCheck, Camera, Award, PiggyBank, Ticket, FileText, Shield, ChevronRight, LifeBuoy, Lock } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/Toast";
import { formatDateBR, maskCPF, maskPhone } from "@/lib/format";
import { calcNivel, NIVEL_INFO, CONQUISTAS } from "@/lib/nivel";
import { brl, economiaCupom } from "@/lib/economia";

export const Route = createFileRoute("/_app/perfil")({
  head: () => ({ meta: [{ title: "Perfil — PromoJá" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, profile, signOut, refresh } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [usados, setUsados] = useState(0);
  const [economia, setEconomia] = useState(0);
  const [favoritos, setFavoritos] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data }, { count: favCount }] = await Promise.all([
        supabase
          .from("solicitacoes")
          .select("cupom:cupons(preco_original, desconto_percentual)")
          .eq("user_id", user.id)
          .eq("status", "usada"),
        supabase
          .from("favoritos")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);
      const list = (data ?? []) as Array<{ cupom: { preco_original: number | null; desconto_percentual: number | null } | null }>;
      setUsados(list.length);
      const total = list.reduce((sum, row) => sum + (row.cupom ? economiaCupom(row.cupom) : 0), 0);
      setEconomia(total);
      setFavoritos(favCount ?? 0);
    };
    load();
  }, [user]);

  const nivel = calcNivel(usados);
  const info = NIVEL_INFO[nivel];
  const progresso = info.next ? Math.min(100, ((usados - info.min) / (info.next - info.min)) * 100) : 100;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.push({ kind: "error", title: "Arquivo muito grande", message: "Máximo 5MB." });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar_url: pub.publicUrl })
        .eq("id", user.id);
      if (profErr) throw profErr;
      await refresh();
      toast.push({ kind: "success", title: "Foto atualizada!" });
    } catch (err) {
      toast.push({ kind: "error", title: "Erro no upload", message: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return null;

  const initials = profile.nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <ScreenHeader title="Meu perfil" />
      <Scroll>
        <div className="px-5">
          <div className="flex flex-col items-center rounded-3xl bg-gradient-card p-6 ring-1 ring-border">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="press relative"
              aria-label="Alterar foto"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.nome}
                  className={`h-24 w-24 rounded-full object-cover ring-4 ${info.ring}`}
                />
              ) : (
                <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary text-3xl font-black text-primary-foreground shadow-glow ring-4 ${info.ring}`}>
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                <Camera size={14} />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <h1 className="mt-3 font-display text-xl font-black text-foreground">{profile.nome}</h1>
            <p className="text-xs text-muted-foreground">{profile.email}</p>

            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${info.gradient} px-3 py-1 text-xs font-extrabold text-white shadow-elev`}>
                <Award size={14} /> {info.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                <ShieldCheck size={14} /> Aprovado
              </span>
            </div>
          </div>

          {/* Stats: economia + cupons usados */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-success/20 to-success/5 p-4 ring-1 ring-success/30">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success">
                <PiggyBank size={12} /> Você economizou
              </div>
              <p className="mt-1 font-display text-xl font-black text-foreground">{brl(economia)}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 ring-1 ring-primary/30">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-glow">
                <Ticket size={12} /> Cupons usados
              </div>
              <p className="mt-1 font-display text-xl font-black text-foreground">{usados}</p>
            </div>
          </div>

          {/* Nível progresso */}
          <div className="mt-4 rounded-2xl bg-surface-2 p-4 ring-1 ring-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seu nível</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {usados} {usados === 1 ? "cupom usado" : "cupons usados"}
                </p>
              </div>
              {info.next && (
                <p className="text-right text-[11px] text-muted-foreground">
                  Faltam <strong className="text-foreground">{info.next - usados}</strong>
                  <br /> para o próximo nível
                </p>
              )}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${info.gradient} transition-all`}
                style={{ width: `${progresso}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-muted-foreground">
              <span>🥉 Bronze</span>
              <span>🥈 Prata (5)</span>
              <span>🥇 Ouro (15)</span>
            </div>
          </div>

          {/* Conquistas */}
          <div className="mt-5">
            <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Conquistas
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {CONQUISTAS.map((c) => {
                const unlocked = c.test({ usados, favoritos, economia });
                return (
                  <div
                    key={c.id}
                    title={`${c.label} — ${c.desc}`}
                    className={
                      "relative flex aspect-square flex-col items-center justify-center rounded-2xl p-1.5 text-center ring-1 transition-all " +
                      (unlocked
                        ? "bg-gradient-to-br from-primary/20 to-primary/5 ring-primary/40"
                        : "bg-surface-2 ring-border opacity-50 grayscale")
                    }
                  >
                    <span className="text-2xl leading-none">{c.emoji}</span>
                    <span className="mt-1 line-clamp-1 text-[9px] font-bold text-foreground">
                      {c.label}
                    </span>
                    {!unlocked && (
                      <Lock
                        size={10}
                        className="absolute right-1 top-1 text-muted-foreground"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suporte (destaque) */}
          <Link
            to="/suporte"
            className="press mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 p-4 ring-1 ring-primary/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <LifeBuoy size={18} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Central de suporte</p>
              <p className="text-[11px] text-muted-foreground">FAQ, WhatsApp e contato</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </Link>

          <div className="mt-5 space-y-2">
            <Item icon={<Mail size={16} />} label="E-mail" value={profile.email} />
            <Item icon={<IdCard size={16} />} label="CPF" value={profile.cpf ? maskCPF(profile.cpf) : "—"} />
            <Item icon={<Phone size={16} />} label="Telefone" value={profile.telefone ? maskPhone(profile.telefone) : "—"} />
            <Item icon={<Calendar size={16} />} label="Nascimento" value={formatDateBR(profile.data_nascimento)} />
            <Item icon={<MapPin size={16} />} label="Cidade" value={profile.cidade ?? "—"} />
          </div>

          <div className="mt-6 space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Documentos legais</p>
            <Link
              to="/termos"
              className="press flex items-center gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-border"
            >
              <FileText size={16} className="text-muted-foreground" />
              <span className="flex-1 text-sm font-semibold text-foreground">Termos de Uso</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
            <Link
              to="/privacidade"
              className="press flex items-center gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-border"
            >
              <Shield size={16} className="text-muted-foreground" />
              <span className="flex-1 text-sm font-semibold text-foreground">Política de Privacidade</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>

            <Link
              to="/debug"
              className="press flex items-center gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-border"
            >
              <Shield size={16} className="text-muted-foreground" />
              <span className="flex-1 text-sm font-semibold text-foreground">Diagnóstico do sistema</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          </div>

          <p className="mt-4 px-1 text-center text-[10px] text-muted-foreground">
            PromoJá Benefícios © {new Date().getFullYear()} — Todos os direitos reservados.
          </p>

          <button
            onClick={handleLogout}
            className="press mt-4 mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-surface-2 px-5 py-3 text-sm font-semibold text-destructive ring-1 ring-border"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </Scroll>
    </>
  );
}

function Item({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-border">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
