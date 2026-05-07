export type Categoria = {
  id: string;
  nome: string;
  icon: string | null;
  ordem: number;
  ativa: boolean;
};

export type Loja = {
  id: string;
  nome: string;
  descricao: string | null;
  endereco: string | null;
  telefone: string | null;
  foto_url: string | null;
  estrelas: number;
  categoria_id: string | null;
  ativa: boolean;
  servicos: string[];
  maps_url: string | null;
};

export type Cupom = {
  id: string;
  loja_id: string;
  titulo: string;
  descricao: string | null;
  desconto: string;
  foto_url: string | null;
  validade: string | null;
  ativo: boolean;
  preco_original: number | null;
  desconto_percentual: number | null;
  loja?: Loja;
};

export type SolicitacaoStatus =
  | "pendente"
  | "aprovada"
  | "negada"
  | "usada"
  | "expirada";

export type Solicitacao = {
  id: string;
  user_id: string;
  cupom_id: string;
  codigo: string;
  status: SolicitacaoStatus;
  admin_resposta: string | null;
  approved_at: string | null;
  used_at: string | null;
  created_at: string;
  cupom?: Cupom;
};

export type Notificacao = {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  link: string | null;
  lida: boolean;
  created_at: string;
};
