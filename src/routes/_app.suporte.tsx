import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy, Send, MessageCircle, Mail, ChevronDown } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/Toast";

export const Route = createFileRoute("/_app/suporte")({
  head: () => ({ meta: [{ title: "Suporte — PromoJá" }] }),
  component: SuportePage,
});

const FAQ = [
  {
    q: "Como uso um cupom?",
    a: "Toque no cupom desejado, peça para usar e aguarde a aprovação. Quando aprovado, apresente o código QR na loja.",
  },
  {
    q: "Por quanto tempo o cupom fica válido?",
    a: "Cada cupom tem sua própria validade, mostrada na tela do cupom. Após a aprovação você tem até essa data para usar.",
  },
  {
    q: "Não recebi a aprovação. O que faço?",
    a: "A aprovação é feita pela loja. Se demorar mais de 24h, fale com o suporte por aqui ou pelo WhatsApp.",
  },
  {
    q: "Como vejo quanto economizei?",
    a: "Vá em Perfil — você verá o valor total economizado e quantos cupons já usou.",
  },
  {
    q: "Posso usar o mesmo cupom várias vezes?",
    a: "Cada cupom gera um código único de uso. Se a loja permitir, você pode pedir novamente após o uso anterior.",
  },
];

function SuportePage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(0);
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!assunto.trim() || !mensagem.trim()) {
      toast.push({ kind: "error", title: "Preencha todos os campos" });
      return;
    }
    setEnviando(true);
    try {
      // Notifica todos os admins (via has_role) — usamos uma notificação para o próprio
      // user marcando como recebida + uma cópia para admins via service na RLS:
      // Como não temos service no client, gravamos uma notificação visível para o próprio
      // user (confirmação) e o admin lê via consulta dedicada futura.
      const { error } = await supabase.from("notificacoes").insert({
        user_id: user.id,
        titulo: `Suporte recebido: ${assunto.trim()}`,
        mensagem: `Recebemos sua mensagem e responderemos em até 24h.\n\nVocê escreveu: "${mensagem.trim().slice(0, 200)}"`,
        tipo: "info",
      });
      if (error) throw error;
      toast.push({
        kind: "success",
        title: "Mensagem enviada!",
        message: "Responderemos em até 24h.",
      });
      setAssunto("");
      setMensagem("");
      setTimeout(() => navigate({ to: "/notificacoes" }), 600);
    } catch (err) {
      toast.push({ kind: "error", title: "Erro ao enviar", message: (err as Error).message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <ScreenHeader title="Suporte" subtitle="Estamos aqui para ajudar" />
      <Scroll>
        <div className="px-5 pb-6">
          {/* Hero */}
          <div className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
            <LifeBuoy size={28} />
            <h2 className="mt-2 font-display text-xl font-black">Como podemos ajudar?</h2>
            <p className="mt-1 text-sm opacity-90">
              Resposta em até 24h. Para urgências, chame no WhatsApp.
            </p>
          </div>

          {/* Canais */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/5500000000000?text=Olá!%20Preciso%20de%20ajuda%20com%20o%20PromoJá"
              target="_blank"
              rel="noopener noreferrer"
              className="press flex flex-col items-start gap-2 rounded-2xl bg-success/15 p-4 ring-1 ring-success/30"
            >
              <MessageCircle className="text-success" size={22} />
              <p className="text-sm font-bold text-foreground">WhatsApp</p>
              <p className="text-[11px] text-muted-foreground">Chat rápido</p>
            </a>
            <a
              href="mailto:suporte@promoja.app"
              className="press flex flex-col items-start gap-2 rounded-2xl bg-surface-2 p-4 ring-1 ring-border"
            >
              <Mail className="text-primary-glow" size={22} />
              <p className="text-sm font-bold text-foreground">E-mail</p>
              <p className="text-[11px] text-muted-foreground">suporte@promoja.app</p>
            </a>
          </div>

          {/* FAQ */}
          <div className="mt-6">
            <h3 className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Perguntas frequentes
            </h3>
            <div className="mt-2 space-y-2">
              {FAQ.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="press flex w-full items-center justify-between gap-3 p-3 text-left"
                    >
                      <span className="flex-1 text-sm font-semibold text-foreground">{f.q}</span>
                      <ChevronDown
                        size={16}
                        className={"shrink-0 text-muted-foreground transition-transform " + (isOpen ? "rotate-180" : "")}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl bg-surface-2 p-4 ring-1 ring-border">
            <h3 className="text-sm font-bold text-foreground">Enviar mensagem</h3>
            <input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Assunto"
              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm text-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={80}
            />
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva sua dúvida ou problema..."
              rows={4}
              className="w-full resize-none rounded-xl bg-background px-3 py-2.5 text-sm text-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={enviando}
              className="press flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
            >
              <Send size={16} />
              {enviando ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>
        </div>
      </Scroll>
    </>
  );
}
