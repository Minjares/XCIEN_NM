import type { Node, Link } from './useNetworkTopology'

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
          // Calculate weight based on bandwidth usage (higher usage = higher weight)
          const weight = link.currentBandwidth ? 1 + (link.currentBandwidth / (link.maxBandwidth || 1)) : 1
          neighbors.push({ id: targetId, weight })
        } else if (targetId === current && unvisited.has(sourceId)) {
          const weight = link.currentBandwidth ? 1 + (link.currentBandwidth / (link.maxBandwidth || 1)) : 1
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

      // Find the link between current node and next hop
      const link = links.value.find(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
        const targetId = typeof link.target === 'object' ? link.target.id : link.target
        return (sourceId === node.id && targetId === nextHopId) ||
               (sourceId === nextHopId && targetId === node.id)
      })

      // Calculate metric based on path length and bandwidth usage
      let metric = path.length - 1 // Base metric is hop count

      // Add bandwidth factor if available
      if (link && link.maxBandwidth && link.currentBandwidth) {
        const usageRatio = link.currentBandwidth / link.maxBandwidth
        // Higher bandwidth usage increases the metric
        metric += usageRatio * 5
      }

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
