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

  // Helper function to get node ID from port ID
  const getNodeIdFromPortId = (portId: string): string => {
    const allPorts = nodes.value.flatMap(node => node.Ports)
    const port = allPorts.find(p => p.id === portId)
    return port ? port.deviceId : portId
  }

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

  // Calculate link weight based on hop count, link type, and available capacity
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
        const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
        const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
        const sourceNodeId = getNodeIdFromPortId(sourcePortId)
        const targetNodeId = getNodeIdFromPortId(targetPortId)

        if (sourceNodeId === current && unvisited.has(targetNodeId)) {
          // Calculate weight based on hop count, link type, and available capacity
          const weight = calculateLinkWeight(link)
          neighbors.push({ id: targetNodeId, weight })
        } else if (targetNodeId === current && unvisited.has(sourceNodeId)) {
          const weight = calculateLinkWeight(link)
          neighbors.push({ id: sourceNodeId, weight })
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

      // Calculate metric based on the total path cost using the same algorithm
      let metric = 0

      // Calculate the total cost for the entire path
      console.log(`Calculating cost for path: ${path.map(id => nodes.value.find(n => n.id === id)?.name || id).join(' → ')}`)

      for (let i = 0; i < path.length - 1; i++) {
        const currentNodeId = path[i]
        const nextNodeId = path[i + 1]
        const currentNodeName = nodes.value.find(n => n.id === currentNodeId)?.name || currentNodeId
        const nextNodeName = nodes.value.find(n => n.id === nextNodeId)?.name || nextNodeId

        // Find the link between current and next node
        const pathLink = links.value.find(link => {
          const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
          const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
          const sourceNodeId = getNodeIdFromPortId(sourcePortId)
          const targetNodeId = getNodeIdFromPortId(targetPortId)
          return (sourceNodeId === currentNodeId && targetNodeId === nextNodeId) ||
                 (sourceNodeId === nextNodeId && targetNodeId === currentNodeId)
        })

        if (pathLink) {
          const linkCost = calculateLinkWeight(pathLink)
          const availableCapacity = (pathLink.maxBandwidth || 0) - (pathLink.currentBandwidth || 0)
          console.log(`  ${currentNodeName} → ${nextNodeName}: Type=${pathLink.type}, Available=${availableCapacity}Mbps, Cost=${linkCost}`)
          metric += linkCost
        } else {
          console.log(`  ${currentNodeName} → ${nextNodeName}: No link found, Cost=10`)
          metric += 10
        }
      }

      console.log(`Total path cost: ${metric}`)

      // Create the route entry
      const finalMetric = Math.round(metric * 10) / 10
      console.log(`Final metric after rounding: ${finalMetric}`)
      console.log(`Creating route with metric: ${finalMetric} at ${new Date().toISOString()}`)

      const newRoute = {
        destination: `${isp.name} (${isp.id})`,
        nextHop: nextHopNode.name,
        interface: `Port-${Math.floor(Math.random() * 8) + 1}`,
        metric: finalMetric,
        path: path.map(id => nodes.value.find(n => n.id === id)?.name || id).join(' → ')
      }

      console.log(`Route object created:`, newRoute)
      routes.value.push(newRoute)
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
