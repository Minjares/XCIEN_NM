import type { Node, Link } from '~/types/network'

export interface CapacityAnalysis {
  routeName: string
  path: string
  feasible: boolean
  needsUpgrade: boolean
  totalCost: number
  bottlenecks: Array<{
    linkId: string
    description: string
    currentUsage: number
    availableCapacity: number
  }>
  upgrades: Array<{
    linkId: string
    description: string
    currentCapacity: number
    newCapacity: number
    cost: number
  }>
  status: string
}

export const useCapacityPlanning = (
  nodes: Ref<Node[]>,
  links: Ref<Link[]>,
  ispNodes: ComputedRef<Node[]>
) => {
  const newNodeName = ref('')
  const newNodeType = ref('router')
  const newNodeCapacity = ref(100)
  const capacityAnalysis = ref<CapacityAnalysis[]>([])

  // Helper function to get node ID from port ID
  const getNodeIdFromPortId = (portId: string): string => {
    const allPorts = nodes.value.flatMap(node => node.Ports)
    const port = allPorts.find(p => p.id === portId)
    return port ? port.deviceId : portId
  }

  // Calculate link weight based on hop count, link type, and available capacity (same as routing)
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

  // Find path between two nodes using BFS (updated for port-based connections)
  const findPathBetweenNodes = (startId: string, endId: string): string[] | null => {
    if (startId === endId) return [startId]

    const visited = new Set<string>()
    const queue: string[][] = [[startId]]
    visited.add(startId)

    while (queue.length > 0) {
      const path = queue.shift()
      if (!path) continue

      const currentNode = path[path.length - 1]

      // Find all neighbors of current node through port connections
      const neighbors: string[] = []
      links.value.forEach(link => {
        const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
        const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
        const sourceNodeId = getNodeIdFromPortId(sourcePortId)
        const targetNodeId = getNodeIdFromPortId(targetPortId)

        if (sourceNodeId === currentNode && !visited.has(targetNodeId)) {
          neighbors.push(targetNodeId)
        } else if (targetNodeId === currentNode && !visited.has(sourceNodeId)) {
          neighbors.push(sourceNodeId)
        }
      })

      for (const neighbor of neighbors) {
        if (neighbor === endId) {
          return [...path, neighbor]
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push([...path, neighbor])
        }
      }
    }

    return null // No path found
  }

  // Calculate upgrade cost based on capacity increase
  const calculateUpgradeCost = (currentCapacity: number, newCapacity: number) => {
    const increase = newCapacity - currentCapacity

    // Base cost per Mbps increase
    const baseCostPerMbps = 2

    // Higher capacity upgrades have economies of scale
    let multiplier = 1
    if (increase > 500) multiplier = 0.8
    if (increase > 1000) multiplier = 0.6

    return Math.round(increase * baseCostPerMbps * multiplier)
  }

  // Analyze capacity for a route to an ISP via a connection point
  const analyzeRouteToISP = (fromNode: Node, connectionPoint: Node, isp: Node, requiredCapacity: number): CapacityAnalysis | null => {
    // Step 1: Find path from selected node to connection point
    const pathToConnection = findPathBetweenNodes(fromNode.id, connectionPoint.id)

    // Step 2: Find path from connection point to ISP
    const pathToISP = findPathBetweenNodes(connectionPoint.id, isp.id)

    if (!pathToConnection || !pathToISP || pathToConnection.length < 2 || pathToISP.length < 2) {
      return {
        routeName: `Via ${connectionPoint.name} → ${isp.name}`,
        path: 'No complete path available',
        feasible: false,
        needsUpgrade: false,
        totalCost: Infinity,
        bottlenecks: [],
        upgrades: [],
        status: 'No Route'
      }
    }

    // Combine paths (remove duplicate connection point)
    const completePath = [...pathToConnection, ...pathToISP.slice(1)]
    const pathNames = completePath.map(id => nodes.value.find(n => n.id === id)?.name || id).join(' → ')

    const bottlenecks: CapacityAnalysis['bottlenecks'] = []
    const upgrades: CapacityAnalysis['upgrades'] = []
    let totalCost = 0
    let feasible = true
    let needsUpgrade = false

    // Analyze each link in the complete path
    for (let i = 0; i < completePath.length - 1; i++) {
      const sourceId = completePath[i]
      const targetId = completePath[i + 1]

      const link = links.value.find(link => {
        const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
        const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
        const sourceNodeId = getNodeIdFromPortId(sourcePortId)
        const targetNodeId = getNodeIdFromPortId(targetPortId)
        return (sourceNodeId === sourceId && targetNodeId === targetId) || (sourceNodeId === targetId && targetNodeId === sourceId)
      })

      if (!link) {
        feasible = false
        continue
      }

      const currentUsage = link.currentBandwidth || 0
      const maxCapacity = link.maxBandwidth || 0
      const availableCapacity = maxCapacity - currentUsage
      const usagePercentage = maxCapacity > 0 ? (currentUsage / maxCapacity) * 100 : 0

      // Check if this link can handle the additional capacity
      if (availableCapacity < requiredCapacity) {
        needsUpgrade = true
        const requiredNewCapacity = currentUsage + requiredCapacity
        const suggestedCapacity = Math.ceil(requiredNewCapacity / 100) * 100 // Round up to nearest 100

        upgrades.push({
          linkId: link.id,
          description: `${nodes.value.find(n => n.id === sourceId)?.name} ↔ ${nodes.value.find(n => n.id === targetId)?.name}`,
          currentCapacity: maxCapacity,
          newCapacity: suggestedCapacity,
          cost: calculateUpgradeCost(maxCapacity, suggestedCapacity)
        })

        totalCost += calculateUpgradeCost(maxCapacity, suggestedCapacity)
      }

      // Check for potential bottlenecks (high usage)
      if (usagePercentage > 70) {
        bottlenecks.push({
          linkId: link.id,
          description: `${nodes.value.find(n => n.id === sourceId)?.name} ↔ ${nodes.value.find(n => n.id === targetId)?.name}`,
          currentUsage: Math.round(usagePercentage),
          availableCapacity: availableCapacity
        })
      }

      // Use the new sophisticated cost calculation
      if (link) {
        totalCost += calculateLinkWeight(link)
      } else {
        totalCost += 10 // Fallback if no link found
      }
    }

    let status = 'Optimal'
    if (!feasible) {
      status = 'No Route'
    } else if (needsUpgrade) {
      status = 'Needs Upgrade'
    } else if (bottlenecks.length > 0) {
      status = 'Potential Issues'
    }

    return {
      routeName: `Via ${connectionPoint.name} → ${isp.name}`,
      path: pathNames,
      feasible: feasible,
      needsUpgrade: needsUpgrade,
      totalCost: Math.round(totalCost),
      bottlenecks: bottlenecks,
      upgrades: upgrades,
      status: status
    }
  }

  // Analyze capacity for a direct route to an ISP
  const analyzeDirectRouteToISP = (fromNode: Node, isp: Node, path: string[], requiredCapacity: number): CapacityAnalysis | null => {
    const pathNames = path.map(id => nodes.value.find(n => n.id === id)?.name || id).join(' → ')

    const bottlenecks: CapacityAnalysis['bottlenecks'] = []
    const upgrades: CapacityAnalysis['upgrades'] = []
    let totalCost = 0
    let feasible = true
    let needsUpgrade = false

    // Analyze each link in the path
    for (let i = 0; i < path.length - 1; i++) {
      const sourceId = path[i]
      const targetId = path[i + 1]

      const link = links.value.find(link => {
        const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
        const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
        const sourceNodeId = getNodeIdFromPortId(sourcePortId)
        const targetNodeId = getNodeIdFromPortId(targetPortId)
        return (sourceNodeId === sourceId && targetNodeId === targetId) || (sourceNodeId === targetId && targetNodeId === sourceId)
      })

      if (!link) {
        feasible = false
        continue
      }

      const currentUsage = link.currentBandwidth || 0
      const maxCapacity = link.maxBandwidth || 0
      const availableCapacity = maxCapacity - currentUsage
      const usagePercentage = maxCapacity > 0 ? (currentUsage / maxCapacity) * 100 : 0

      // Check if this link can handle the additional capacity
      if (availableCapacity < requiredCapacity) {
        needsUpgrade = true
        const requiredNewCapacity = currentUsage + requiredCapacity
        const suggestedCapacity = Math.ceil(requiredNewCapacity / 100) * 100 // Round up to nearest 100

        upgrades.push({
          linkId: link.id,
          description: `${nodes.value.find(n => n.id === sourceId)?.name} ↔ ${nodes.value.find(n => n.id === targetId)?.name}`,
          currentCapacity: maxCapacity,
          newCapacity: suggestedCapacity,
          cost: calculateUpgradeCost(maxCapacity, suggestedCapacity)
        })

        totalCost += calculateUpgradeCost(maxCapacity, suggestedCapacity)
      }

      // Check for potential bottlenecks (high usage)
      if (usagePercentage > 70) {
        bottlenecks.push({
          linkId: link.id,
          description: `${nodes.value.find(n => n.id === sourceId)?.name} ↔ ${nodes.value.find(n => n.id === targetId)?.name}`,
          currentUsage: Math.round(usagePercentage),
          availableCapacity: availableCapacity
        })
      }

      // Use the new sophisticated cost calculation
      if (link) {
        totalCost += calculateLinkWeight(link)
      } else {
        totalCost += 10 // Fallback if no link found
      }
    }

    let status = 'Optimal'
    if (!feasible) {
      status = 'No Route'
    } else if (needsUpgrade) {
      status = 'Needs Upgrade'
    } else if (bottlenecks.length > 0) {
      status = 'Potential Issues'
    }

    return {
      routeName: `${fromNode.name} to ${isp.name}`,
      path: pathNames,
      feasible: feasible,
      needsUpgrade: needsUpgrade,
      totalCost: Math.round(totalCost),
      bottlenecks: bottlenecks,
      upgrades: upgrades,
      status: status
    }
  }

  // Calculate capacity plan for adding a new node
  const calculateCapacityPlan = (selectedNode: Node) => {
    if (!selectedNode || !newNodeName.value || !newNodeCapacity.value) {
      return
    }

    console.log('Calculating capacity plan for:', {
      selectedNode: selectedNode.name,
      newNode: newNodeName.value,
      capacity: newNodeCapacity.value
    })

    capacityAnalysis.value = []

    // Find all ISP nodes in the network
    const isps = ispNodes.value
    if (isps.length === 0) {
      console.warn('No ISP nodes found in the network')
      return
    }

    // For each ISP, find the optimal path from the selected node
    isps.forEach(isp => {
      const directPath = findPathBetweenNodes(selectedNode.id, isp.id)

      if (directPath && directPath.length >= 2) {
        // Analyze the direct path to this ISP
        const analysis = analyzeDirectRouteToISP(selectedNode, isp, directPath, newNodeCapacity.value)
        if (analysis) {
          capacityAnalysis.value.push(analysis)
        }
      }
    })

    // Remove duplicate routes based on the actual path
    const uniqueRoutes: CapacityAnalysis[] = []
    const seenPaths = new Set<string>()

    capacityAnalysis.value.forEach(route => {
      if (!seenPaths.has(route.path)) {
        seenPaths.add(route.path)
        uniqueRoutes.push(route)
      }
    })

    capacityAnalysis.value = uniqueRoutes

    // Sort by feasibility and cost
    capacityAnalysis.value.sort((a, b) => {
      if (a.feasible && !b.feasible) return -1
      if (!a.feasible && b.feasible) return 1
      if (a.needsUpgrade && !b.needsUpgrade) return 1
      if (!a.needsUpgrade && b.needsUpgrade) return -1
      return a.totalCost - b.totalCost
    })

    console.log('Capacity analysis results:', capacityAnalysis.value)
  }

  return {
    newNodeName,
    newNodeType,
    newNodeCapacity,
    capacityAnalysis,
    calculateCapacityPlan
  }
}
