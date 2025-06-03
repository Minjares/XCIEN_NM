import type { SimulationNodeDatum } from 'd3';

export interface Port {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  deviceId: string;
}

export interface Node extends SimulationNodeDatum {
  id: string;
  type: 'router' | 'switch' | 'isp';
  name: string;
  x?: number;
  y?: number;
  Ports: Port[];
}

export interface Link {
  id: string;
  source: string | Port;
  target: string | Port;
  type: 'fiber' | 'microwave';
  maxBandwidth: number;
  currentBandwidth: number; 
  value?: number; 
}
