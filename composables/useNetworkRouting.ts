import type { Node, Link } from '~/types/network'

export interface Route {
  destination: string
  nextHop: string
  interface: string
  metric: number
  path?: string
}

export const useNetworkRouting = (
  nodes: Ref<Node[]>,
  links: Ref<Link[]>,
  ispNodes: ComputedRef<Node[]>
) => {
  const routes = ref<Route[]>([])
  const selectedNode = ref<Node | null>(null)

  // Get connected nodes for the selected node
  const connectedNodes = computed(() => {
    if (!selectedNode.value) return []

    // Find all links connected to this node
    const connectedLinks = links.value.filter((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source
      const targetId = typeof link.target === "object" ? link.target.id : link.target
      return (
        sourceId === selectedNode.value!.id || targetId === selectedNode.value!.id
      )
    })

    // Get the nodes on the other end of these links
    return connectedLinks
      .map((link) => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source
        const targetId = typeof link.target === "object" ? link.target.id : link.target
        const connectedNodeId =
          sourceId === selectedNode.value!.id ? targetId : sourceId
        return nodes.value.find((n) => n.id === connectedNodeId)
      })
      .filter(Boolean) as Node[] // Filter out any undefined nodes
  })

  // Calculate link weight considering connection type, capacity, and usage
  const calculateLinkWeight = (link: Link): number => {
    // Base weight (hop count factor)
    let weight = 1.0

    // Connection type multiplier (fiber is best, microwave is standard)
    const connectionTypeMultiplier: Record<string, number> = {
      'fiber': 0.8,      // Fiber is 20% better than base
      'microwave': 1.0,  // Microwave is the baseline
      'ethernet': 0.9,   // Ethernet is 10% better than microwave
      'wireless': 1.2,   // Wireless is 20% worse than baseline
      'satellite': 1.5   // Satellite is 50% worse than baseline
    }

    const typeMultiplier = connectionTypeMultiplier[link.type] || 1.0
    weight *= typeMultiplier

    // Bandwidth usage factor (higher usage = higher weight)
    if (link.maxBandwidth && link.currentBandwidth !== undefined) {
      const usageRatio = link.currentBandwidth / link.maxBandwidth
      const availableCapacityRatio = 1 - usageRatio

      // Heavily penalize links with low available capacity
      if (availableCapacityRatio < 0.1) {
        // Less than 10% capacity available - very high penalty
        weight *= 3.0
      } else if (availableCapacityRatio < 0.3) {
        // Less than 30% capacity available - high penalty
        weight *= 2.0
      } else if (availableCapacityRatio < 0.5) {
        // Less than 50% capacity available - moderate penalty
        weight *= 1.5
      } else if (availableCapacityRatio > 0.8) {
        // More than 80% capacity available - bonus
        weight *= 0.9
      }

      // Additional usage penalty (gradual increase with usage)
      weight += usageRatio * 0.5
    }

    // Capacity bonus - higher capacity links get slight preference
    if (link.maxBandwidth) {
      if (link.maxBandwidth >= 1000) {
        weight *= 0.95  // 5% bonus for high capacity links (1Gbps+)
      } else if (link.maxBandwidth >= 500) {
        weight *= 0.98  // 2% bonus for medium-high capacity links (500Mbps+)
      } else if (link.maxBandwidth < 100) {
        weight *= 1.1   // 10% penalty for low capacity links (<100Mbps)
      }
    }

    return weight
  }

  // Calculate comprehensive path metric considering all links in the path
  const calculatePathMetric = (path: string[]): number => {
    // Base metric is hop count
    let metric = path.length - 1

    // Add weight factors for each link in the path
    for (let i = 0; i < path.length - 1; i++) {
      const sourceId = path[i]
      const targetId = path[i + 1]

      // Find the link between these nodes
      const link = links.value.find(link => {
        const linkSourceId = typeof link.source === 'object' ? link.source.id : link.source
        const linkTargetId = typeof link.target === 'object' ? link.target.id : link.target
        return (linkSourceId === sourceId && linkTargetId === targetId) ||
               (linkSourceId === targetId && linkTargetId === sourceId)
      })

      if (link) {
        // Get the enhanced weight for this link
        const linkWeight = calculateLinkWeight(link)
        // Add the weight factor to the metric (subtract 1 to avoid double-counting the base hop)
        metric += (linkWeight - 1) * 2 // Multiply by 2 to give more weight to link quality
      }
    }

    return metric
  }

  // Calculate the best path to an ISP using Dijkstra's algorithm
  const findBestPathToISP = (startNodeId: string, ispId: string): string[] | null => {
    // Initialize distances with infinity for all nodes except the start node
    const distances: Record<string, number> = {}
    const previous: Record<string, string | null> = {}
    const unvisited = new Set<string>()

    nodes.value.forEach(node => {
      distances[node.id] = node.id === startNodeId ? 0 : Infinity
      previous[node.id] = null
      unvisited.add(node.id)
    })

    while (unvisited.size > 0) {
      // Find the unvisited node with the smallest distance
      let current: string | null = null
      let smallestDistance = Infinity

      unvisited.forEach(nodeId => {
        if (distances[nodeId] < smallestDistance) {
          smallestDistance = distances[nodeId]
          current = nodeId
        }
      })

      // If we can't find a node or we've reached the ISP, we're done
      if (current === null || current === ispId) break

      // Remove the current node from unvisited
      unvisited.delete(current)

      // Find all neighbors of the current node
      const neighbors: Array<{ id: string; weight: number }> = []
      links.value.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
        const targetId = typeof link.target === 'object' ? link.target.id : link.target

        if (sourceId === current && unvisited.has(targetId)) {
          const weight = calculateLinkWeight(link)
          neighbors.push({ id: targetId, weight })
        } else if (targetId === current && unvisited.has(sourceId)) {
          const weight = calculateLinkWeight(link)
          neighbors.push({ id: sourceId, weight })
        }
      })

      // Update distances to neighbors
      neighbors.forEach(neighbor => {
        const alt = distances[current!] + neighbor.weight
        if (alt < distances[neighbor.id]) {
          distances[neighbor.id] = alt
          previous[neighbor.id] = current
        }
      })
    }

    // Reconstruct the path
    const path: string[] = []
    let current: string | null = ispId

    while (current !== null) {
      path.unshift(current)
      current = previous[current]
    }

    // If the path doesn't start with our start node, there's no path
    if (path.length === 0 || path[0] !== startNodeId) {
      return null
    }

    return path
  }

  // Generate routes for the selected node to reach ISPs
  const generateRoutesForNode = (node: Node) => {
    // Clear previous routes
    routes.value = []

    if (!node) return

    console.log('Generating routes for node:', node.id)

    // Find all ISP nodes
    const isps = ispNodes.value
    if (isps.length === 0) return

    // For each ISP, find the best path
    isps.forEach(isp => {
      const path = findBestPathToISP(node.id, isp.id)

      if (!path || path.length <= 1) {
        // No path found
        routes.value.push({
          destination: `${isp.name} (${isp.id})`,
          nextHop: 'Unreachable',
          interface: 'N/A',
          metric: Infinity
        })
        return
      }

      // Get the next hop in the path
      const nextHopId = path[1]
      const nextHopNode = nodes.value.find(n => n.id === nextHopId)

      if (!nextHopNode) return

      // Calculate comprehensive metric based on entire path
      let metric = calculatePathMetric(path)

      // Create the route entry
      routes.value.push({
        destination: `${isp.name} (${isp.id})`,
        nextHop: nextHopNode.name,
        interface: `Port-${Math.floor(Math.random() * 8) + 1}`,
        metric: Math.round(metric * 10) / 10, // Round to 1 decimal place
        path: path.map(id => nodes.value.find(n => n.id === id)?.name || id).join(' → ')
      })
    })

    // Sort routes by metric (best routes first)
    routes.value.sort((a, b) => a.metric - b.metric)

    // Add a default route using the best ISP route
    if (routes.value.length > 0 && routes.value[0].nextHop !== 'Unreachable') {
      routes.value.push({
        destination: '0.0.0.0/0 (Default)',
        nextHop: routes.value[0].nextHop,
        interface: routes.value[0].interface,
        metric: routes.value[0].metric
      })
    }

    console.log('Generated routes:', routes.value)
  }

  // Select a node
  const selectNode = (node: Node) => {
    selectedNode.value = node
    generateRoutesForNode(node)
    console.log('Selected node:', node)
  }

  return {
    routes,
    selectedNode,
    connectedNodes,
    selectNode,
    generateRoutesForNode
  }
}
