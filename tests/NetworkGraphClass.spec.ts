import { describe, it, expect } from 'vitest';
import { NetworkGraph} from '~/types/network';
import type { Node, Link } from '~/types/network';

describe('NetworkGraph Class', () => {
  // Test data
  const testNodes: Node[] = [
    {
      id: 'router-1',
      type: 'router',
      name: 'Router 1',
      Ports: [
        { id: 'port-r1-1', name: 'Port 1', status: 'active', deviceId: 'router-1' },
        { id: 'port-r1-2', name: 'Port 2', status: 'active', deviceId: 'router-1' }
      ]
    },
    {
      id: 'switch-1',
      type: 'switch',
      name: 'Switch 1',
      Ports: [
        { id: 'port-s1-1', name: 'Port 1', status: 'active', deviceId: 'switch-1' },
        { id: 'port-s1-2', name: 'Port 2', status: 'active', deviceId: 'switch-1' }
      ]
    }
  ];
  
  const testLinks: Link[] = [
    {
      id: 'link-1',
      type: 'cable',
      source: 'port-r1-1',
      target: 'port-s1-1',
      maxBandwidth: 1000,
      currentBandwidth: 500
    }
  ];

  it('should add and retrieve nodes', () => {
    const graph = new NetworkGraph();
    graph.addNode(testNodes[0]);
    
    expect(graph.getNode(testNodes[0].id)).toEqual(testNodes[0]);
  });
  
  it('should add and retrieve links', () => {
    const graph = new NetworkGraph();
    graph.addLink(testLinks[0]);
    
    expect(graph.getLink(testLinks[0].id)).toEqual(testLinks[0]);
  });
  
  it('should remove nodes and their connected links', () => {
    const graph = new NetworkGraph();
    testNodes.forEach(node => graph.addNode(node));
    testLinks.forEach(link => graph.addLink(link));
    
    graph.removeNode('router-1');
    
    expect(graph.getNode('router-1')).toBeUndefined();
    expect(graph.getLink('link-1')).toBeUndefined();
  });
  
  it('should identify high bandwidth links', () => {
    const graph = new NetworkGraph();
    testNodes.forEach(node => graph.addNode(node));
    
    // Add a normal link
    graph.addLink({
      id: 'normal-link',
      type: 'cable',
      source: 'port-r1-1',
      target: 'port-s1-1',
      maxBandwidth: 1000,
      currentBandwidth: 500 // 50% usage
    });
    
    // Add a high bandwidth link
    graph.addLink({
      id: 'high-link',
      type: 'cable',
      source: 'port-r1-2',
      target: 'port-s1-2',
      maxBandwidth: 1000,
      currentBandwidth: 900 // 90% usage
    });
    
    const highLinks = graph.getLinksByBandwidthUsage(80);
    
    expect(highLinks.length).toBe(1);
    expect(highLinks[0].id).toBe('high-link');
  });
  
  it('should calculate node bandwidth usage', () => {
    const graph = new NetworkGraph();
    testNodes.forEach(node => graph.addNode(node));
    
    // Add inbound link to router-1
    graph.addLink({
      id: 'link-in',
      type: 'cable',
      source: 'port-s1-1',
      target: 'port-r1-1',
      maxBandwidth: 1000,
      currentBandwidth: 300
    });
    
    // Add outbound link from router-1
    graph.addLink({
      id: 'link-out',
      type: 'cable',
      source: 'port-r1-2',
      target: 'port-s1-2',
      maxBandwidth: 1000,
      currentBandwidth: 200
    });
    
    const usage = graph.getNodeBandwidthUsage('router-1');
    
    expect(usage.inbound).toBe(300);
    expect(usage.outbound).toBe(200);
    expect(usage.total).toBe(500);
  });
  
  it('should serialize and deserialize correctly', () => {
    const graph = new NetworkGraph();
    testNodes.forEach(node => graph.addNode(node));
    testLinks.forEach(link => graph.addLink(link));
    
    const json = graph.toJSON();
    const newGraph = NetworkGraph.fromJSON(json);
    
    expect(newGraph.getNode('router-1')).toEqual(testNodes[0]);
    expect(newGraph.getLink('link-1')).toEqual(testLinks[0]);
  });
});