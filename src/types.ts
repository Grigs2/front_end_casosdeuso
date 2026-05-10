export type UserRole = 'driver' | 'guardian' | 'school' | null;

export interface Driver {
  id: number;
  nome: string;
  veiculo: string;
  placa: string;
  telefone: string;
}

export interface SolicitacaoVinculo {
  id: number;
  dependenteNome: string;
  responsavelNome: string;
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO';
  dataSolicitacao: string;
}

export interface Parada {
  id: number;
  tipo: 'INICIO' | 'EMBARQUE' | 'DESEMBARQUE' | 'ESCOLA';
  descricao: string;
  dependentes?: string[];
  horarioPrevisto: string;
}

export interface Mensagem {
  id: number;
  conteudo: string;
  data: string;
  remetente: string;
  lida: boolean;
}
