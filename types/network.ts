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
  type: 'cable' | 'microwave';
  id: string;
  source: string | Port;
  target: string | Port;
  maxBandwidth: number;
  currentBandwidth: number;
}

// Graph data structure
export class NetworkGraph {
  nodes: Map<string, Node>;
  links: Map<string, Link>;

  constructor() {
    this.nodes = new Map<string, Node>();
    this.links = new Map<string, Link>();
  }

  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  removeNode(id: string): boolean {
    // Remove all links connected to this node
    this.links.forEach((link, linkId) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      if (sourceId === id || targetId === id) {
        this.links.delete(linkId);
      }
    });
    
    return this.nodes.delete(id);
  }

  addLink(link: Link): void {
    this.links.set(link.id, link);
  }

  getLink(id: string): Link | undefined {
    return this.links.get(id);
  }

  removeLink(id: string): boolean {
    return this.links.delete(id);
  }

  getNodeConnections(nodeId: string): Array<{linkId: string, nodeId: string}> {
    const connections: Array<{linkId: string, nodeId: string}> = [];
    
    this.links.forEach((link, linkId) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      if (sourceId === nodeId) {
        connections.push({ linkId, nodeId: targetId });
      } else if (targetId === nodeId) {
        connections.push({ linkId, nodeId: sourceId });
      }
    });
    
    return connections;
  }

  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()),
      links: Array.from(this.links.values())
    };
  }

  static fromJSON(data: {nodes: Node[], links: Link[]}): NetworkGraph {
    const graph = new NetworkGraph();
    
    data.nodes.forEach(node => graph.addNode(node));
    data.links.forEach(link => graph.addLink(link));
    
    return graph;
  }
}
