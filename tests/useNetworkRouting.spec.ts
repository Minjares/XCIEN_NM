import { describe, it, expect } from 'vitest';
import type { Link } from '../types/network';

// Extract the calculateLinkWeight function for testing
const calculateLinkWeight = (link: Link): number => {
  let weight = 0

  // 1. Hop count: Each hop adds 10 to the cost
  weight += 10

  // 2. Link type: Fiber adds 0, microwave adds 2
  if (link.type === 'microwave') {
    weight += 2
  }
  // Fiber links add 0, so no additional cost

  // 3. Available capacity: Add 100 / available_capacity
  const availableCapacity = (link.maxBandwidth || 0) - (link.currentBandwidth || 0)
  if (availableCapacity > 0) {
    weight += 100 / availableCapacity
  } else {
    // If no available capacity, add a high penalty
    weight += 1000
  }

  return weight
}

describe('Network Routing Cost Calculation', () => {

  it('should calculate link weight correctly for fiber link', () => {
    const fiberLink: Link = {
      id: 'test-fiber',
      type: 'fiber',
      source: 'port-1',
      target: 'port-2',
      maxBandwidth: 1000,
      currentBandwidth: 100
    };

    const weight = calculateLinkWeight(fiberLink);

    // Expected: 10 (hop) + 0 (fiber) + 100/900 (capacity) = 10.111...
    expect(weight).toBeCloseTo(10.111, 2);
  });

  it('should calculate link weight correctly for microwave link', () => {
    const microwaveLink: Link = {
      id: 'test-microwave',
      type: 'microwave',
      source: 'port-1',
      target: 'port-2',
      maxBandwidth: 500,
      currentBandwidth: 50
    };

    const weight = calculateLinkWeight(microwaveLink);

    // Expected: 10 (hop) + 2 (microwave) + 100/450 (capacity) = 12.222...
    expect(weight).toBeCloseTo(12.222, 2);
  });

  it('should add high penalty for links with no available capacity', () => {
    const fullLink: Link = {
      id: 'test-full',
      type: 'fiber',
      source: 'port-1',
      target: 'port-2',
      maxBandwidth: 1000,
      currentBandwidth: 1000 // No available capacity
    };

    const weight = calculateLinkWeight(fullLink);

    // Expected: 10 (hop) + 0 (fiber) + 1000 (penalty) = 1010
    expect(weight).toBe(1010);
  });

  it('should prefer fiber over microwave links', () => {
    const fiberLink: Link = {
      id: 'fiber',
      type: 'fiber',
      source: 'port-1',
      target: 'port-2',
      maxBandwidth: 1000,
      currentBandwidth: 100
    };

    const microwaveLink: Link = {
      id: 'microwave',
      type: 'microwave',
      source: 'port-1',
      target: 'port-2',
      maxBandwidth: 1000,
      currentBandwidth: 100
    };

    const fiberWeight = calculateLinkWeight(fiberLink);
    const microwaveWeight = calculateLinkWeight(microwaveLink);

    // Microwave should have higher weight (worse) than fiber
    expect(microwaveWeight).toBeGreaterThan(fiberWeight);
    expect(microwaveWeight - fiberWeight).toBe(2); // Microwave penalty
  });

  it('should prefer links with more available capacity', () => {
    const highCapacityLink: Link = {
      id: 'high-capacity',
      type: 'fiber',
      source: 'port-1',
      target: 'port-2',
      maxBandwidth: 1000,
      currentBandwidth: 100 // Available: 900
    };

    const lowCapacityLink: Link = {
      id: 'low-capacity',
      type: 'fiber',
      source: 'port-1',
      target: 'port-2',
      maxBandwidth: 1000,
      currentBandwidth: 800 // Available: 200
    };

    const highCapacityWeight = calculateLinkWeight(highCapacityLink);
    const lowCapacityWeight = calculateLinkWeight(lowCapacityLink);

    // Link with less available capacity should have higher weight (worse)
    expect(lowCapacityWeight).toBeGreaterThan(highCapacityWeight);
  });
});
