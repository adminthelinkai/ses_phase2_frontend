/**
 * CORE DOMAIN MODELS
 */

export enum Department {
  ADMIN = 'ADMIN',
  MANAGEMENT = 'MANAGEMENT',
  CSA = 'CSA',
  ELECTRICAL = 'ELECTRICAL',
  INSTRUMENT = 'INSTRUMENT',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  PROCESS = 'PROCESS',
  MECHANICAL = 'MECHANICAL'
}

export enum Role {
  ADMIN = 'ADMIN',
  HEAD_SES = 'HEAD_SES',
  MANAGEMENT = 'MANAGEMENT',
  HOD = 'HOD',
  ENGINEER = 'ENGINEER',
  DESIGNER = 'DESIGNER'
}

export interface Node {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
  assignedDepartment: Department;
  order: number;
}

export interface Deliverable {
  id: string;
  projectId: string;
  name: string;
  discipline: Department;
  nodes: Node[]; // Fixed chain
}

export interface User {
  id: string;
  name: string;
  department: Department;
  role: Role;
  participantId?: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}