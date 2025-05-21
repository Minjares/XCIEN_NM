import type { SimulationNodeDatum } from 'd3';

export interface Node extends SimulationNodeDatum {
  id: string;
  type: 'router' | 'switch';
  name: string;
  x?: number;
  y?: number;
}

export interface Link {
  id: string;
  source: string | Node;
  target: string | Node;
}
