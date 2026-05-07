import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — PromoJá Benefícios" },
      {
        name: "description",
        content:
          "Política de Privacidade do app PromoJá Benefícios: como coletamos, usamos e protegemos seus dados pessoais (LGPD).",
      },
      { property: "og:title", content: "Política de Privacidade — PromoJá Benefícios" },
      {
        property: "og:description",
        content:
          "Saiba como tratamos seus dados pessoais no app PromoJá Benefícios, em conformidade com a LGPD.",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
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
          <h1 className="text-base font-bold">Política de Privacidade</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-xs text-muted-foreground">Última atualização: {hoje}</p>

        <section className="mt-6 space-y-4 text-sm leading-relaxed">
          <p>
            Esta Política de Privacidade descreve como o aplicativo{" "}
            <strong>PromoJá Benefícios</strong> ("nós", "aplicativo", "controlador") coleta, usa,
            armazena, compartilha e protege os dados pessoais dos usuários ("você", "titular"), em
            conformidade com a <strong>Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018)</strong>,
            o Marco Civil da Internet (Lei nº 12.965/2014) e o Código de Defesa do Consumidor.
          </p>
          <p>
            Ao se cadastrar e utilizar o app, você declara estar ciente e concorda com as práticas
            descritas nesta Política e nos nossos{" "}
            <Link to="/termos" className="font-semibold text-primary-glow underline">
              Termos de Uso
            </Link>
            .
          </p>
        </section>

        <Section title="1. Quem é o controlador">
          <p>
            O controlador dos dados é o operador do aplicativo PromoJá Benefícios. Para qualquer
            assunto relacionado a privacidade ou exercício de direitos, contate nosso Encarregado
            de Dados (DPO):{" "}
            <a
              href="mailto:contato@promoja.app"
              className="font-semibold text-primary-glow underline"
            >
              contato@promoja.app
            </a>
            .
          </p>
        </Section>

        <Section title="2. Dados que coletamos">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Cadastro:</strong> nome completo, e-mail, CPF, telefone, data de nascimento, cidade, foto de perfil e senha (armazenada com hash criptográfico — nunca em texto puro).</li>
            <li><strong>Uso do app:</strong> cupons solicitados e utilizados, lojas favoritadas, notificações, histórico de interações e estatísticas de economia.</li>
            <li><strong>Técnicos:</strong> endereço IP, tipo de dispositivo, sistema operacional, idioma, registros de acesso e logs de segurança (Lei nº 12.965/2014).</li>
          </ul>
          <p className="mt-2">
            Não coletamos dados sensíveis (saúde, biometria, opinião política, religião etc.) nem
            dados de geolocalização precisa.
          </p>
        </Section>

        <Section title="3. Bases legais (LGPD art. 7º)">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Execução do contrato:</strong> permitir cadastro, autenticação e funcionamento do app.</li>
            <li><strong>Consentimento:</strong> envio de foto de perfil e comunicações promocionais opcionais.</li>
            <li><strong>Cumprimento de obrigação legal:</strong> guarda de registros de acesso por 6 meses (Marco Civil).</li>
            <li><strong>Legítimo interesse:</strong> prevenção a fraudes, segurança e melhoria do serviço.</li>
          </ul>
        </Section>

        <Section title="4. Como usamos seus dados">
          <ul className="list-disc space-y-2 pl-5">
            <li>Permitir login, autenticação, aprovação de cadastro e uso das funcionalidades.</li>
            <li>Validar a utilização de cupons junto às lojas parceiras (apenas dados estritamente necessários).</li>
            <li>Calcular sua economia, nível (Bronze, Prata, Ouro) e estatísticas pessoais.</li>
            <li>Enviar notificações operacionais sobre status de solicitações e novas ofertas.</li>
            <li>Prevenir fraudes, abusos e violações destes Termos.</li>
            <li>Melhorar continuamente a estabilidade, segurança e usabilidade do aplicativo.</li>
          </ul>
        </Section>

        <Section title="5. Compartilhamento de dados">
          <p>
            <strong>Não vendemos seus dados.</strong> Compartilhamos somente quando estritamente
            necessário e apenas com:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Lojas parceiras:</strong> apenas o necessário para validar a utilização de um cupom (ex.: nome e código da solicitação).</li>
            <li><strong>Operadores e provedores de infraestrutura</strong> (hospedagem, banco de dados, envio de e-mail), sob contrato de sigilo e cláusulas LGPD.</li>
            <li><strong>Autoridades públicas:</strong> quando exigido por lei, ordem judicial ou autoridade competente.</li>
          </ul>
        </Section>

        <Section title="6. Armazenamento, retenção e segurança">
          <ul className="list-disc space-y-2 pl-5">
            <li>Dados são armazenados em servidores seguros, com criptografia em trânsito (HTTPS/TLS) e controle de acesso por papéis.</li>
            <li>Aplicamos políticas de segurança em nível de banco (RLS) para que cada usuário acesse apenas seus próprios dados.</li>
            <li><strong>Retenção:</strong> dados de cadastro são mantidos enquanto a conta estiver ativa; logs de acesso por <strong>6 meses</strong> (Marco Civil); registros financeiros e fiscais por até <strong>5 anos</strong> quando aplicável.</li>
            <li>Após o prazo, os dados são anonimizados ou eliminados de forma segura, salvo obrigação legal em contrário.</li>
          </ul>
          <p className="mt-2">
            Apesar dos esforços técnicos, nenhum sistema é 100% imune. Em caso de incidente de
            segurança que possa gerar risco relevante, comunicaremos os titulares afetados e a
            ANPD nos termos da LGPD.
          </p>
        </Section>

        <Section title="7. Seus direitos como titular (LGPD art. 18)">
          <p>A qualquer momento, você pode solicitar:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Confirmação da existência de tratamento dos seus dados.</li>
            <li>Acesso, correção, atualização ou anonimização dos dados.</li>
            <li>Portabilidade para outro fornecedor.</li>
            <li>Eliminação dos dados tratados com base em consentimento.</li>
            <li>Informação sobre com quem compartilhamos seus dados.</li>
            <li>Revogação de consentimento previamente concedido.</li>
            <li>Exclusão completa da conta.</li>
          </ul>
          <p className="mt-2">
            Os pedidos podem ser feitos pelo e-mail{" "}
            <a href="mailto:contato@promoja.app" className="font-semibold text-primary-glow underline">
              contato@promoja.app
            </a>
            . Responderemos no menor prazo possível, em regra até <strong>15 dias</strong>.
          </p>
        </Section>

        <Section title="8. Cookies e armazenamento local">
          <p>
            Utilizamos armazenamento local do dispositivo apenas para manter sua sessão ativa e
            preferências do app. <strong>Não usamos cookies de rastreamento publicitário</strong>{" "}
            de terceiros.
          </p>
        </Section>

        <Section title="9. Crianças e adolescentes">
          <p>
            O app é destinado a maiores de <strong>18 anos</strong>. Adolescentes podem usá-lo
            somente com consentimento e supervisão dos responsáveis legais. Caso identifiquemos
            cadastro indevido de criança, removeremos os dados imediatamente.
          </p>
        </Section>

        <Section title="10. Transferência internacional">
          <p>
            Alguns provedores de infraestrutura podem armazenar dados em servidores fora do
            Brasil. Sempre exigimos garantias contratuais e técnicas compatíveis com a LGPD para
            tais transferências.
          </p>
        </Section>

        <Section title="11. Alterações nesta Política">
          <p>
            Esta Política pode ser atualizada periodicamente. Alterações relevantes serão
            comunicadas pelo aplicativo. A data da última atualização aparece no topo desta
            página. O uso continuado do app após a atualização implica concordância com a nova
            versão.
          </p>
        </Section>

        <Section title="12. Contato e Encarregado de Dados (DPO)">
          <p>
            Para dúvidas, reclamações ou exercício dos seus direitos, escreva para:{" "}
            <a
              href="mailto:contato@promoja.app"
              className="font-semibold text-primary-glow underline"
            >
              contato@promoja.app
            </a>
            .
          </p>
          <p className="mt-2">
            Você também pode dirigir-se à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>{" "}
            caso entenda que seus direitos não foram adequadamente atendidos.
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
            to="/termos"
            className="press inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-bold text-foreground ring-1 ring-border"
          >
            Termos de Uso
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
