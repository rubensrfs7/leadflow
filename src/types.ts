export interface HistoryEntry {
  message: string;
  timestamp: string;
  user?: string;
}

export interface CommentEntry {
  text: string;
  timestamp: string;
  user: string;
}

export interface Lead {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  origem?: string;
  valor_estimado?: number | null;
  moeda: string;
  tags: string[];
  ip?: string;
  fbp?: string;
  fbc?: string;
  coluna_atual: string;
  historico: HistoryEntry[];
  criado_em: string;
  atualizado_em: string;
  comentarios: CommentEntry[];
  notas: string[];
  responsavel?: string;
  score: number;
  condicao_negociacao?: string;
  motivo_perda?: string;
  plano_vendido?: string;
  segmento_atuacao?: string;
  avaliacao_lead?: string;
  conjunto?: string;
  campanha?: string;
  criativo?: string;
  cidade?: string;
  estado?: string;
  protocolo?: string;
}

export interface Settings {
  pixelId: string;
  accessToken: string;
  configurado: boolean;
}

export const COLUMNS = [
  'Novo Lead',
  'Contato',
  'Qualificado',
  'Proposta',
  'Negociação',
  'Fechado Won',
  'Pós-venda',
  'Perdido'
];
