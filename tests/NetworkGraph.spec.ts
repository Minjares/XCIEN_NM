import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { NetworkGraph as NetworkGraphClass } from '~/types/network';
import NetworkGraph from '~/components/NetworkGraph.vue';

// Mock data
const mockNodes = [
  {
    id: 'router-1',
    type: 'router',
    name: 'Router 1',
    Ports: [
      { id: 'port-r1-1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router-1' },
      { id: 'port-r1-2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router-1' }
    ]
  },
  {
    id: 'switch-1',
    type: 'switch',
    name: 'Switch 1',
    Ports: [
      { id: 'port-s1-1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch-1' }
    ]
  }
];

const mockLinks = [
  {
    id: 'link-1',
    type: 'cable',
    source: 'port-r1-1',
    target: 'port-s1-1',
    maxBandwidth: 1000,
    currentBandwidth: 500
  }
];

describe('NetworkGraph Component', () => {
  it('renders properly with props', () => {
    const wrapper = mount(NetworkGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    });
    
    expect(wrapper.find('svg').exists()).toBe(true);
  });
  
  it('emits node-selected event when a node is clicked', async () => {
    const wrapper = mount(NetworkGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    });
    
    // Wait for D3 to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Find and click a node
    const nodeElement = wrapper.find('.node');
    await nodeElement.trigger('click');
    
    // Check if the event was emitted with the correct node ID
    expect(wrapper.emitted('node-selected')).toBeTruthy();
  });
});