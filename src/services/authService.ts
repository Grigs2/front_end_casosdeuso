// src/services/authService.ts
// VERSÃO MOCK PARA DEMONSTRAÇÃO - Ignora rede e retorna dados fictícios

import { API } from './api';

// --- Tipos que espelham seus DTOs do Java ---

export interface UsuarioDTO {
  id?: number;
  email: string;
  senha: string;
  endereco: string;
  telefone: string;
  tipoPerfil: string;
}

export interface MotoristaDTO {
  id?: number;
  nome: string;
  dataNascimento: string; // formato: "YYYY-MM-DD"
  cpf: string;
  cnh: string;
  usuarioDTO: UsuarioDTO;
  veiculoDTO?: VeiculoDTO;
}

export interface ResponsavelDTO {
  id?: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  usuario: UsuarioDTO;
  dependentes?: DependenteDTO[];
}

export interface DependenteDTO {
  id?: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  periodo: string;
  endereco: string;
}

export interface VeiculoDTO {
  id?: number;
  modelo: string;
  placa: string;
  ano: number;
  capacidade: number;
}

// --- Funções de autenticação MOCK ---

export async function autenticarMotorista(
  email: string,
  senha: string
): Promise<MotoristaDTO> {
  // Retorna um motorista fictício imediatamente
  return Promise.resolve({
    id: 1,
    nome: 'Motorista de Teste',
    dataNascimento: '1985-05-20',
    cpf: '123.456.789-00',
    cnh: '123456789',
    usuarioDTO: {
      id: 1,
      email: email,
      senha: senha,
      endereco: 'Rua das Peruas, 123',
      telefone: '11999998888',
      tipoPerfil: 'MOTORISTA'
    },
    veiculoDTO: {
      id: 1,
      modelo: 'Sprinter Branca',
      placa: 'ABC-1234',
      ano: 2022,
      capacidade: 16
    }
  });
}

export async function autenticarResponsavel(
  email: string,
  senha: string
): Promise<ResponsavelDTO> {
  // Retorna um responsável fictício imediatamente
  return Promise.resolve({
    id: 1,
    nome: 'Responsável de Teste',
    cpf: '987.654.321-99',
    dataNascimento: '1990-10-10',
    usuario: {
      id: 2,
      email: email,
      senha: senha,
      endereco: 'Av. Brasil, 500',
      telefone: '11977776666',
      tipoPerfil: 'RESPONSAVEL'
    },
    dependentes: [
      {
        id: 1,
        nome: 'Nathan Silva',
        cpf: '111.222.333-44',
        dataNascimento: '2015-01-01',
        periodo: 'MANHA',
        endereco: 'Av. Brasil, 500'
      }
    ]
  });
}

// --- Funções de cadastro MOCK ---

export async function cadastrarMotorista(
  dto: Omit<MotoristaDTO, 'id'>
): Promise<MotoristaDTO> {
  return Promise.resolve({ ...dto, id: Math.floor(Math.random() * 1000) } as MotoristaDTO);
}

export async function cadastrarResponsavel(
  dto: Omit<ResponsavelDTO, 'id'>
): Promise<ResponsavelDTO> {
  return Promise.resolve({ ...dto, id: Math.floor(Math.random() * 1000) } as ResponsavelDTO);
}

export async function cadastrarDependente(
  idResponsavel: number,
  dto: Omit<DependenteDTO, 'id'>
): Promise<ResponsavelDTO> {
  return Promise.resolve({
    id: idResponsavel,
    nome: 'Responsável',
    cpf: '000',
    dataNascimento: '000',
    usuario: { email: 'test@test.com', senha: '', endereco: '', telefone: '', tipoPerfil: '' },
    dependentes: [dto as DependenteDTO]
  } as ResponsavelDTO);
}
