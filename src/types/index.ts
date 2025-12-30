/**
 * CORE DOMAIN MODELS
 */

export enum Department {
  CSA = 'CSA',
  ELECTRICAL = 'ELECTRICAL',
  MECHANICAL = 'MECHANICAL',
  INSTRUMENTATION = 'INSTRUMENTATION',
  PM = 'PROJECT_MANAGEMENT'
}

export enum Role {
  HOD = 'HOD',
  TEAM_LEAD = 'TEAM_LEAD',
  ENGINEER = 'ENGINEER',
  DESIGNER = 'DESIGNER',
  HEAD_OF_SES = 'HEAD_OF_SES',
  ADMIN = 'ADMIN'
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
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}