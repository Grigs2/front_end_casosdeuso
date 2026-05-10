// src/services/api.ts
// Troque pelo IP da sua máquina na rede local (não use localhost no celular físico!)
// Para descobrir seu IP: no Windows, rode "ipconfig" no terminal
//                        no Mac/Linux, rode "ifconfig" ou "ip addr"

const BASE_URL = 'http://192.168.1.9:8080/TioDaPerua/api';

export const API = {
  // Autenticação
  autenticarMotorista: `${BASE_URL}/Motorista/Autenticar`,
  autenticarResponsavel: `${BASE_URL}/Responsavel/Autenticar`,

  // Cadastro
  cadastrarMotorista: `${BASE_URL}/Motorista/Cadastrar`,
  cadastrarResponsavel: `${BASE_URL}/Responsavel/Cadastrar`,

  // Dependentes
  cadastrarDependente: (idResponsavel: number) =>
    `${BASE_URL}/Responsavel/CadastrarDependente/${idResponsavel}`,

  // Veículo
  cadastrarVeiculo: (idMotorista: number) =>
    `${BASE_URL}/Motorista/CadastrarVeiculo/${idMotorista}`,

  // Viagem e Vínculos
  buscarMotoristas: (busca: string) => `${BASE_URL}/Motorista/Buscar?q=${busca}`,
  solicitarVinculo: `${BASE_URL}/Viagem/SolicitarDependente`,
  listarSolicitacoesPendentes: (idMotorista: number) => `${BASE_URL}/Motorista/Solicitacoes/${idMotorista}`,
  responderSolicitacao: (idSolicitacao: number) => `${BASE_URL}/Motorista/ResponderSolicitacao/${idSolicitacao}`,

  // Monitoramento e Rota
  obterRoteiro: (idMotorista: number) => `${BASE_URL}/Viagem/Roteiro/${idMotorista}`,
  obterStatusAlunos: (idViagem: number) => `${BASE_URL}/Viagem/StatusAlunos/${idViagem}`,

  // Mural
  obterAvisos: (idUsuario: number, role: string) => `${BASE_URL}/Mural/Avisos/${role}/${idUsuario}`,
};