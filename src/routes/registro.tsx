import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ChevronLeft, User, Mail, Lock, Phone, IdCard, Calendar, MapPin, Camera } from "lucide-react";
import logoPromoja from "@/assets/logo-promoja.png";
import { PhoneFrame } from "@/components/PhoneFrame";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/Toast";
import { maskCPF, maskPhone } from "@/lib/format";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Criar conta — PromoJá Benefícios" },
      { name: "description", content: "Crie sua conta PromoJá em menos de 1 minuto." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    cidade: "",
    senha: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.push({ kind: "error", title: "Arquivo muito grande", message: "Máximo 5MB." });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha.length < 8) {
      toast.push({ kind: "error", title: "Senha muito curta", message: "Mínimo 8 caracteres." });
      return;
    }
    const cpfDigits = form.cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      toast.push({ kind: "error", title: "CPF inválido" });
      return;
    }
    setLoading(true);
    const { data: signUp, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          nome: form.nome,
          cpf: cpfDigits,
          telefone: form.telefone.replace(/\D/g, ""),
          data_nascimento: form.data_nascimento,
          cidade: form.cidade,
        },
      },
    });
    if (error) {
      setLoading(false);
      toast.push({ kind: "error", title: "Erro no cadastro", message: error.message });
      return;
    }
    if (avatarFile && signUp.user && signUp.session) {
      try {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `${signUp.user.id}/${Date.now()}.${ext}`;
        await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", signUp.user.id);
      } catch {
        // sem bloqueio — pode subir depois no perfil
      }
    }
    setLoading(false);
    toast.push({
      kind: "success",
      title: "Conta criada!",
      message: "Aguarde aprovação do administrador.",
    });
    navigate({ to: "/" });
  };

  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />

        <div className="relative z-10 flex items-center px-4 pt-4">
          <Link to="/login" aria-label="Voltar" className="press flex h-10 w-10 items-center justify-center rounded-full glass">
            <ChevronLeft size={20} />
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pt-4 pb-8 animate-fade-up">
          <img
            src={logoPromoja}
            alt="PromoJá"
            className="h-16 w-16 object-contain drop-shadow-[0_0_20px_rgba(255,90,30,0.3)]"
          />
          <h1 className="mt-4 font-display text-3xl font-black leading-tight text-foreground">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Após o cadastro, sua conta passará por aprovação.
          </p>

          <form onSubmit={onSubmit} className="mt-6 rounded-3xl glass p-5 shadow-elev">
            <div className="mb-4 flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="press relative"
                aria-label="Enviar foto de perfil"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 ring-2 ring-border">
                    <User size={28} className="text-muted-foreground" />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                  <Camera size={12} />
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              <p className="mt-2 text-[11px] text-muted-foreground">Foto de perfil (opcional)</p>
            </div>
            <Field icon={<User size={18} />} label="Nome completo" autoComplete="name" placeholder="Seu nome" value={form.nome} onChange={(v) => set("nome", v)} />
            <Field icon={<Mail size={18} />} label="E-mail" type="email" inputMode="email" autoComplete="email" placeholder="voce@exemplo.com" value={form.email} onChange={(v) => set("email", v)} />
            <Field icon={<IdCard size={18} />} label="CPF" inputMode="numeric" placeholder="000.000.000-00" value={form.cpf} onChange={(v) => set("cpf", maskCPF(v))} />
            <Field icon={<Phone size={18} />} label="Celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={form.telefone} onChange={(v) => set("telefone", maskPhone(v))} />
            <Field icon={<Calendar size={18} />} label="Data de nascimento" type="date" value={form.data_nascimento} onChange={(v) => set("data_nascimento", v)} />
            <Field icon={<MapPin size={18} />} label="Cidade" placeholder="São Paulo" value={form.cidade} onChange={(v) => set("cidade", v)} />
            <Field icon={<Lock size={18} />} label="Senha" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={(v) => set("senha", v)} />

            <label className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[oklch(0.66_0.22_38)]" />
              <span>
                Li e concordo com os{" "}
                <Link to="/termos" target="_blank" className="text-primary-glow font-semibold underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link to="/privacidade" target="_blank" className="text-primary-glow font-semibold underline">
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="press mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-glow disabled:opacity-70"
            >
              {loading ? "Criando conta..." : "Criar minha conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem cadastro?{" "}
            <Link to="/login" className="font-bold text-primary-glow">Entrar</Link>
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  ...rest
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        <span className="text-muted-foreground">{icon}</span>
        <input
          {...rest}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </label>
  );
}
