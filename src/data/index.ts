
export interface Project {
  id: string;
  name: string;
  status: 'active' | 'archived' | 'on-hold';
}

export interface DeliverableItem {
  id: string;
  code: string;
  name: string;
  status: 'active' | 'pending' | 'completed';
}

export interface NodeItem {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'blocked' | 'pending';
}

export const projects: Project[] = [
  { id: 'PRJ-24-082', name: 'Refinery-X Expansion', status: 'active' },
  { id: 'PRJ-24-115', name: 'Solar Farm Alpha', status: 'active' },
  { id: 'PRJ-23-004', name: 'Bridge 42 Overpass', status: 'archived' },
  { id: 'PRJ-25-001', name: 'Gas Plant Zeta', status: 'on-hold' },
];

export const deliverablesMap: Record<string, DeliverableItem[]> = {
  'PRJ-24-082': [
    { id: 'FD-099', code: 'CSA-FD-099', name: 'Structural Foundation', status: 'active' },
    { id: 'EL-201', code: 'ELEC-EL-201', name: 'Main Switchgear MCC', status: 'pending' },
    { id: 'ME-305', code: 'MECH-ME-305', name: 'Centrifugal Pump Set', status: 'pending' },
  ],
  'PRJ-24-115': [
    { id: 'PV-101', code: 'ELEC-PV-101', name: 'Array Layout Design', status: 'active' },
    { id: 'INV-402', code: 'INST-INV-402', name: 'Inverter Control Logic', status: 'pending' },
  ],
  'PRJ-23-004': [
    { id: 'BR-900', code: 'CSA-BR-900', name: 'Abutment Reinforcement', status: 'completed' },
    { id: 'ST-88', code: 'CSA-ST-088', name: 'Span Segment 04', status: 'active' },
  ],
  'PRJ-25-001': [
    { id: 'GP-Z1', code: 'MECH-GP-Z1', name: 'Pressure Vessel V-101', status: 'active' },
  ]
};

export const deliverableWorkflows: Record<string, NodeItem[]> = {
  'FD-099': [
    { id: 'geometrysplit', name: 'Geometry Split', status: 'completed' },
    { id: 'materialspec', name: 'Material Spec', status: 'completed' },
    { id: 'interimreview', name: 'Interim Review', status: 'in_progress' },
    { id: 'electricalreview', name: 'Electrical Review', status: 'blocked' }
  ],
  'EL-201': [
    { id: 'diagram', name: 'SLD Finalisation', status: 'completed' },
    { id: 'loadcalc', name: 'Load Schedule', status: 'in_progress' },
    { id: 'procurement', name: 'Procurement Spec', status: 'pending' }
  ],
  'PV-101': [
    { id: 'mapping', name: 'Topographic Mapping', status: 'completed' },
    { id: 'layout', name: 'Array Orientation', status: 'in_progress' },
    { id: 'shading', name: 'Shading Analysis', status: 'pending' }
  ],
  'BR-900': [
    { id: 'rebar', name: 'Rebar Schedule', status: 'completed' },
    { id: 'concrete', name: 'Pour Sequence', status: 'completed' }
  ],
  'ST-88': [
    { id: 'girder', name: 'Girder Placement', status: 'in_progress' }
  ],
  'GP-Z1': [
    { id: 'vessel-spec', name: 'Vessel Specification', status: 'in_progress' }
  ]
};
