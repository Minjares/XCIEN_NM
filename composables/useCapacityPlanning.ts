import type { Node, Link } from './useNetworkTopology'

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

  // Find path between two nodes using BFS
  const findPathBetweenNodes = (startId: string, endId: string): string[] | null => {
    if (startId === endId) return [startId]

    const visited = new Set<string>()
    const queue: string[][] = [[startId]]
    visited.add(startId)

    while (queue.length > 0) {
      const path = queue.shift()
      if (!path) continue

      const currentNode = path[path.length - 1]

      // Find all neighbors of current node
      const neighbors: string[] = []
      links.value.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
        const targetId = typeof link.target === 'object' ? link.target.id : link.target

        if (sourceId === currentNode && !visited.has(targetId)) {
          neighbors.push(targetId)
        } else if (targetId === currentNode && !visited.has(sourceId)) {
          neighbors.push(sourceId)
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
        const s = typeof link.source === 'object' ? link.source.id : link.source
        const t = typeof link.target === 'object' ? link.target.id : link.target
        return (s === sourceId && t === targetId) || (s === targetId && t === sourceId)
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

      // Base cost for using this path (distance/hop cost)
      totalCost += 10 // Base cost per hop
    }

    // Add cost for the new connection itself (from selected node to connection point)
    totalCost += 50 // Base cost for new connection

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

    // Find all possible connection points (nodes that can connect to the selected node)
    const connectionCandidates = nodes.value.filter(node =>
      node.id !== selectedNode.id &&
      (node.type === 'router' || node.type === 'switch')
    )

    // For each connection candidate, analyze routes to all ISPs
    connectionCandidates.forEach(candidate => {
      isps.forEach(isp => {
        const analysis = analyzeRouteToISP(selectedNode, candidate, isp, newNodeCapacity.value)
        if (analysis) {
          capacityAnalysis.value.push(analysis)
        }
      })
    })

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
