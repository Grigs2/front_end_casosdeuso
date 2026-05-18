import React, { createContext, useContext, useState } from 'react';

// --- Global Data Models (Based on API & Technical Proposal) ---

export interface User {
  id: number;
  nome: string;
  email: string;
  endereco: string;
  telefone: string;
  tipoPerfil: 'MOTORISTA' | 'RESPONSAVEL' | 'ESCOLA';
}

export interface School {
  id: number;
  nome: string;
  endereco: string;
}

export interface Dependent {
  id: number;
  nome: string;
  cpf: string;
  idade: number;
  sexo: 'M' | 'F';
  periodo: 'MANHA' | 'TARDE' | 'NOITE';
  endereco: string;
  id_escola: number;
  id_responsavel: number;
}

export interface Vehicle {
  modelo: string;
  placa: string;
  ano: number;
  capacidade: number;
}

export interface Driver {
  id: number;
  nome: string;
  id_usuario: number;
  veiculo?: Vehicle;
}

export interface Trip {
  id: number;
  id_motorista: number;
  periodo: 'MANHA' | 'TARDE' | 'NOITE';
  status_operacional: 'PLANEJADA' | 'EM_ANDAMENTO' | 'FINALIZADA';
}

export interface Solicitation {
  id: number;
  id_viagem: number;
  id_dependente: number;
  id_responsavel: number;
  aceito: boolean;
  respondido: boolean;
}

export interface PresenceLog {
  id: number;
  id_viagem: number;
  id_dependente: number;
  status: 'ESPERANDO' | 'EMBARCADO' | 'DESEMBARCADO' | 'FALTOU';
  timestamp: string;
  data: string; // YYYY-MM-DD
}

export interface Notification {
  id: number;
  destinatarioId: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
}

// --- Context Definition ---

interface AppContextType {
  // Global State (The "Database")
  currentUser: User | null;
  schools: School[];
  dependents: Dependent[];
  trips: Trip[];
  solicitations: Solicitation[];
  presenceLogs: PresenceLog[];
  notifications: Notification[];
  drivers: Driver[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  registerVehicle: (driverId: number, vehicle: Vehicle) => void;
  createTrip: (periodo: Trip['periodo']) => number;
  requestStudent: (tripId: number, studentId: number) => void;
  approveSolicitation: (solId: number) => void;
  denySolicitation: (solId: number) => void;
  startTrip: (tripId: number) => void;
  finishTrip: (tripId: number) => void;
  markPresence: (tripId: number, studentId: number, status: PresenceLog['status']) => void;
  addDependent: (dep: Omit<Dependent, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [schools] = useState<School[]>([
    { id: 1, nome: 'Escola Municipal Pequeno Príncipe', endereco: 'Rua das Flores, 999' },
    { id: 2, nome: 'Colégio Adventista - Unidade Central', endereco: 'Avenida Brasil, 456' },
    { id: 3, nome: 'EMEF Paulo Freire', endereco: 'Rua da Paz, 123' },
  ]);

  const [dependents, setDependents] = useState<Dependent[]>([
    { id: 50, nome: 'Enzo Silva', cpf: '111.222.333-44', idade: 8, sexo: 'M', periodo: 'MANHA', endereco: 'Avenida Brasil, 100', id_escola: 1, id_responsavel: 11 },
    { id: 51, nome: 'Ana Oliveira', cpf: '222.333.444-55', idade: 7, sexo: 'F', periodo: 'MANHA', endereco: 'Rua das Palmeiras, 789', id_escola: 1, id_responsavel: 12 },
    { id: 52, nome: 'Lucas Santos', cpf: '333.444.555-66', idade: 9, sexo: 'M', periodo: 'TARDE', endereco: 'Rua C, 30', id_escola: 2, id_responsavel: 13 },
  ]);

  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 1, nome: 'João do Caminhão', id_usuario: 10, veiculo: { modelo: 'Sprinter', placa: 'ABC-1234', ano: 2022, capacidade: 20 } }
  ]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [presenceLogs, setPresenceLogs] = useState<PresenceLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- Implementation of Actions ---

  const addDependent = (dep: Omit<Dependent, 'id'>) => {
    const newDep = { ...dep, id: Date.now() };
    setDependents([...dependents, newDep]);
  };

  const registerVehicle = (driverId: number, vehicle: Vehicle) => {
    setDrivers(drivers.map(d => d.id === driverId ? { ...d, veiculo: vehicle } : d));
  };

  const createTrip = (periodo: Trip['periodo']) => {
    const id = Math.floor(Math.random() * 900) + 100;
    const newTrip: Trip = {
      id,
      id_motorista: 1, // Mock current driver
      periodo,
      status_operacional: 'PLANEJADA'
    };
    setTrips([...trips, newTrip]);
    return id;
  };

  const requestStudent = (tripId: number, studentId: number) => {
    const student = dependents.find(d => d.id === studentId);
    if (!student) return;

    const newSol: Solicitation = {
      id: Date.now(),
      id_viagem: tripId,
      id_dependente: studentId,
      id_responsavel: student.id_responsavel,
      aceito: false,
      respondido: false
    };
    setSolicitations([...solicitations, newSol]);
  };

  const approveSolicitation = (solId: number) => {
    setSolicitations(solicitations.map(s => s.id === solId ? { ...s, aceito: true, respondido: true } : s));
    
    // Add notification logic if needed
  };

  const denySolicitation = (solId: number) => {
    setSolicitations(solicitations.map(s => s.id === solId ? { ...s, aceito: false, respondido: true } : s));
  };

  const startTrip = (tripId: number) => {
    setTrips(trips.map(t => t.id === tripId ? { ...t, status_operacional: 'EM_ANDAMENTO' } : t));
    
    // Generate initial presence log for all accepted students in this trip
    const acceptedStudents = solicitations
      .filter(s => s.id_viagem === tripId && s.aceito)
      .map(s => s.id_dependente);
      
    const today = new Date().toISOString().split('T')[0];
    const newLogs: PresenceLog[] = acceptedStudents.map(sId => ({
      id: Math.random(),
      id_viagem: tripId,
      id_dependente: sId,
      status: 'ESPERANDO',
      timestamp: new Date().toISOString(),
      data: today
    }));
    
    setPresenceLogs([...presenceLogs, ...newLogs]);
  };

  const finishTrip = (tripId: number) => {
    setTrips(trips.map(t => t.id === tripId ? { ...t, status_operacional: 'FINALIZADA' } : t));
  };

  const markPresence = (tripId: number, studentId: number, status: PresenceLog['status']) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    
    setPresenceLogs(presenceLogs.map(log => 
      (log.id_viagem === tripId && log.id_dependente === studentId && log.data === today)
        ? { ...log, status, timestamp }
        : log
    ));

    // Send Notification to Guardian
    const student = dependents.find(d => d.id === studentId);
    if (student) {
      const newNotif: Notification = {
        id: Date.now(),
        destinatarioId: student.id_responsavel,
        titulo: `Status do Aluno: ${student.nome}`,
        mensagem: `${student.nome} está agora: ${status}.`,
        lida: false,
        data: timestamp
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      schools, dependents, trips, solicitations, presenceLogs, notifications, drivers,
      registerVehicle, createTrip, requestStudent, approveSolicitation, denySolicitation, startTrip, finishTrip, markPresence, addDependent
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
