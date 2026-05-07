import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — PromoJá Benefícios" },
      {
        name: "description",
        content:
          "Termos e Condições de Uso do app PromoJá Benefícios. Leia antes de utilizar o serviço.",
      },
      { property: "og:title", content: "Termos de Uso — PromoJá Benefícios" },
      {
        property: "og:description",
        content:
          "Regras, direitos e responsabilidades para uso do aplicativo PromoJá Benefícios.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  const hoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="press inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface ring-1 ring-border"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base font-bold">Termos de Uso</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-xs text-muted-foreground">Última atualização: {hoje}</p>

        <section className="mt-6 space-y-4 text-sm leading-relaxed">
          <p>
            Bem-vindo(a) ao <strong>PromoJá Benefícios</strong> ("aplicativo", "plataforma", "nós").
            Estes Termos de Uso ("Termos") regulam o acesso e uso do aplicativo. Ao se cadastrar,
            acessar ou utilizar a plataforma, você ("usuário") declara ter lido, entendido e
            concordado integralmente com estes Termos e com nossa{" "}
            <Link to="/privacidade" className="font-semibold text-primary-glow underline">
              Política de Privacidade
            </Link>
            . Caso não concorde, não utilize o aplicativo.
          </p>
        </section>

        <Section title="1. Sobre o serviço">
          <p>
            O PromoJá Benefícios é uma plataforma que conecta usuários a cupons de desconto e
            ofertas oferecidos por <strong>lojas parceiras independentes</strong>. O aplicativo
            atua como <strong>intermediário tecnológico</strong>: não vende, não fornece, não
            entrega, não fabrica e não presta os produtos ou serviços anunciados pelas lojas.
          </p>
          <p className="mt-2">
            Toda a relação comercial decorrente do uso de um cupom (atendimento, qualidade,
            entrega, garantia, troca, devolução, fiscal etc.) é estabelecida{" "}
            <strong>diretamente entre o usuário e a loja parceira</strong>.
          </p>
        </Section>

        <Section title="2. Cadastro e elegibilidade">
          <ul className="list-disc space-y-2 pl-5">
            <li>É necessário ter no mínimo <strong>18 anos</strong> ou estar acompanhado dos responsáveis legais.</li>
            <li>Você se compromete a fornecer informações <strong>verdadeiras, completas e atualizadas</strong>.</li>
            <li>O acesso é pessoal e intransferível. Você é o único responsável por manter o sigilo da sua senha.</li>
            <li>O cadastro está sujeito a <strong>aprovação prévia</strong> e podemos recusar ou suspender contas a nosso critério, sempre observando a legislação vigente.</li>
            <li>É proibido criar contas falsas, usar dados de terceiros sem autorização ou burlar mecanismos de verificação.</li>
          </ul>
        </Section>

        <Section title="3. Uso permitido">
          <p>Ao usar o app, você concorda em <strong>NÃO</strong>:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Revender, duplicar, transferir, fotografar para terceiros ou comercializar cupons.</li>
            <li>Usar o mesmo cupom mais de uma vez ou em desacordo com as regras de cada oferta.</li>
            <li>Utilizar bots, scripts, scraping, engenharia reversa ou meios automatizados.</li>
            <li>Inserir conteúdo ilegal, ofensivo, discriminatório, difamatório ou que viole direitos de terceiros.</li>
            <li>Tentar acessar áreas restritas, dados de outros usuários ou comprometer a segurança da plataforma.</li>
            <li>Usar o app para fins comerciais não autorizados, marketing, spam ou concorrência desleal.</li>
          </ul>
          <p className="mt-2">
            O descumprimento permite a <strong>suspensão imediata</strong> da conta, sem aviso
            prévio, e pode resultar em medidas judiciais.
          </p>
        </Section>

        <Section title="4. Cupons, ofertas e disponibilidade">
          <ul className="list-disc space-y-2 pl-5">
            <li>Os cupons são fornecidos pelas lojas parceiras e podem ter <strong>quantidade limitada, prazo de validade, condições específicas e regras de uso próprias</strong>.</li>
            <li>Valores de "economia" exibidos no app são <strong>estimativas</strong> baseadas em informações fornecidas pela loja e podem variar no momento da compra.</li>
            <li>Lojas parceiras podem alterar, encerrar ou cancelar ofertas a qualquer momento. Não garantimos a manutenção de qualquer cupom.</li>
            <li>Eventuais erros visíveis (preços, percentuais ou descrições incorretas) podem ser corrigidos sem aviso prévio e <strong>não geram obrigação</strong> de honrar a oferta equivocada.</li>
          </ul>
        </Section>

        <Section title="5. Limitação de responsabilidade">
          <p>
            Na máxima extensão permitida pela legislação aplicável, o PromoJá Benefícios{" "}
            <strong>NÃO se responsabiliza por</strong>:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Qualidade, segurança, legalidade, fiscal ou origem dos produtos e serviços ofertados pelas lojas parceiras.</li>
            <li>Recusa, atraso, defeito, vício ou qualquer problema na execução da oferta pela loja.</li>
            <li>Danos indiretos, lucros cessantes, perda de oportunidade ou qualquer prejuízo decorrente do uso ou da impossibilidade de uso da plataforma.</li>
            <li>Indisponibilidade temporária do serviço por manutenção, falhas técnicas, ataques, força maior ou caso fortuito.</li>
            <li>Conteúdo, links ou informações inseridos por terceiros (lojas, usuários, parceiros).</li>
          </ul>
          <p className="mt-2">
            Reclamações sobre produtos e serviços devem ser direcionadas <strong>diretamente à
            loja parceira</strong>. Atuaremos apenas como facilitadores de comunicação, quando
            possível e a nosso critério.
          </p>
        </Section>

        <Section title="6. Propriedade intelectual">
          <p>
            Todo o conteúdo do app — incluindo marca, logotipo, layout, textos, imagens, código,
            base de dados e funcionalidades — é de propriedade exclusiva do PromoJá Benefícios ou
            de seus licenciantes, protegido pelas leis de propriedade intelectual. É proibida
            qualquer reprodução, modificação, distribuição ou uso comercial sem autorização
            prévia e expressa por escrito.
          </p>
        </Section>

        <Section title="7. Conteúdo enviado pelo usuário">
          <p>
            Ao enviar foto de perfil, comentários ou qualquer conteúdo, você declara possuir
            todos os direitos sobre ele e concede à plataforma uma licença <strong>gratuita,
            mundial e não exclusiva</strong> para exibi-lo dentro do app, exclusivamente para
            viabilizar o serviço. Você é o único responsável pelo conteúdo que envia.
          </p>
        </Section>

        <Section title="8. Privacidade e proteção de dados">
          <p>
            O tratamento de dados pessoais segue a{" "}
            <Link to="/privacidade" className="font-semibold text-primary-glow underline">
              Política de Privacidade
            </Link>
            , parte integrante destes Termos, em conformidade com a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018 — LGPD).
          </p>
        </Section>

        <Section title="9. Suspensão e encerramento">
          <p>
            Podemos, a qualquer tempo e a nosso critério, suspender, restringir ou encerrar o
            acesso de um usuário em caso de violação destes Termos, suspeita de fraude, uso
            indevido ou ordem legal. O usuário também pode encerrar sua conta a qualquer momento
            solicitando a exclusão pelos canais de contato.
          </p>
        </Section>

        <Section title="10. Alterações dos Termos">
          <p>
            Estes Termos podem ser atualizados a qualquer momento. Mudanças relevantes serão
            comunicadas pelo aplicativo. O uso continuado após a publicação implica aceitação da
            nova versão. A data da última atualização aparece no topo desta página.
          </p>
        </Section>

        <Section title="11. Comunicações">
          <p>
            Ao se cadastrar, você concorda em receber comunicações operacionais (status de conta,
            cupons, segurança) por e-mail, push e/ou notificação no app. Comunicações promocionais
            podem ser desativadas a qualquer momento.
          </p>
        </Section>

        <Section title="12. Lei aplicável e foro">
          <p>
            Estes Termos são regidos pelas leis da <strong>República Federativa do Brasil</strong>.
            Fica eleito o foro da comarca do domicílio do consumidor para dirimir quaisquer
            controvérsias, conforme Código de Defesa do Consumidor.
          </p>
        </Section>

        <Section title="13. Contato">
          <p>
            Dúvidas sobre estes Termos podem ser enviadas para{" "}
            <a
              href="mailto:contato@promoja.app"
              className="font-semibold text-primary-glow underline"
            >
              contato@promoja.app
            </a>
            .
          </p>
        </Section>

        <div className="mt-10 mb-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="press inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
          <Link
            to="/privacidade"
            className="press inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-bold text-foreground ring-1 ring-border"
          >
            Política de Privacidade
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
