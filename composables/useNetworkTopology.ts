import type { Port, Node, Link } from '~/types/network'

export interface TopologyTab {
  id: string
  label: string
  value: string
  description: string
  icon: string
}

export const useNetworkTopology = () => {
  const nodes = ref<Node[]>([])
  const links = ref<Link[]>([])
  const activeTab = ref("sanLuis")
  const topologyTabs = ref<TopologyTab[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Initialize bandwidth refresh composable
  const {
    isRefreshingBandwidth,
    refreshProgress,
    refreshErrors,
    refreshTopologyBandwidth
  } = useNetworkBandwidthRefresh()

  // Fetch topologies from API
  const fetchTopologies = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch('/api/topologies') as { success: boolean; data: any[] }

      if (response.success) {
        topologyTabs.value = response.data.map((topology: any) => ({
          id: topology.id,
          label: topology.name,
          value: topology.id,
          description: `Network topology for ${topology.name} region`,
          icon: topology.id === 'sanLuis' ? 'i-heroicons-map' : 'i-heroicons-map-pin'
        }))
      }
    } catch (err) {
      console.error('Error fetching topologies:', err)
      error.value = 'Failed to fetch topologies'
      // Fallback to hardcoded data
      topologyTabs.value = [
        {
          id: "sanLuis",
          label: "San Luis",
          value: "sanLuis",
          description: "Network topology for San Luis region",
          icon: "i-heroicons-map",
        },
        {
          id: "piedrasNegras",
          label: "Piedras Negras",
          value: "piedrasNegras",
          description: "Network topology for Piedras Negras region",
          icon: "i-heroicons-map-pin",
        },
      ]
    } finally {
      isLoading.value = false
    }
  }

  // Fetch topology data (nodes and links) from API
  const fetchTopologyData = async (topologyId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch(`/api/topologies/${topologyId}`) as {
        success: boolean;
        data: {
          topology: any;
          nodes: Node[];
          links: Link[]
        }
      }

      if (response.success) {
        nodes.value = response.data.nodes
        links.value = response.data.links
      }
    } catch (err) {
      console.error('Error fetching topology data:', err)
      error.value = 'Failed to fetch topology data'
    } finally {
      isLoading.value = false
    }
  }




  const handleTabChange = async (tabId: string) => {
    console.log("Tab changed to:", tabId)
    activeTab.value = tabId
    await fetchTopologyData(tabId)
  }

  const refreshTopology = async () => {
    await fetchTopologyData(activeTab.value)
  }

  const refreshBandwidthData = async () => {
    await refreshTopologyBandwidth(activeTab.value)
  }

  // Get link bandwidth information between two nodes
  const getLinkBandwidth = (sourceId: string, targetId: string) => {
    const link = links.value.find(link => {
      const s = typeof link.source === 'object' ? link.source.id : link.source
      const t = typeof link.target === 'object' ? link.target.id : link.target
      return (s === sourceId && t === targetId) || (s === targetId && t === sourceId)
    })

    if (link && link.maxBandwidth) {
      return {
        maxBandwidth: link.maxBandwidth,
        currentBandwidth: link.currentBandwidth || 0
      }
    }

    return null
  }

  // Helper function to get node ID from port ID
  const getNodeIdFromPortId = (portId: string): string => {
    const port = getAllPorts().find(p => p.id === portId)
    return port ? port.deviceId : portId
  }

  // Helper function to get all ports from all nodes
  const getAllPorts = (): Port[] => {
    return nodes.value.flatMap(node => node.Ports)
  }

  // Helper function to find path between two nodes using BFS (updated for port-based connections)
  const findPathBetweenNodes = (startNodeId: string, endNodeId: string): string[] | null => {
    const visited = new Set<string>()
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: startNodeId, path: [startNodeId] }]

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!

      if (nodeId === endNodeId) {
        return path
      }

      if (visited.has(nodeId)) {
        continue
      }

      visited.add(nodeId)

      // Find all connected nodes through port connections
      const connectedNodes = links.value
        .filter(link => {
          const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
          const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
          const sourceNodeId = getNodeIdFromPortId(sourcePortId)
          const targetNodeId = getNodeIdFromPortId(targetPortId)
          return sourceNodeId === nodeId || targetNodeId === nodeId
        })
        .map(link => {
          const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
          const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
          const sourceNodeId = getNodeIdFromPortId(sourcePortId)
          const targetNodeId = getNodeIdFromPortId(targetPortId)
          return sourceNodeId === nodeId ? targetNodeId : sourceNodeId
        })

      for (const connectedNodeId of connectedNodes) {
        if (!visited.has(connectedNodeId)) {
          queue.push({
            nodeId: connectedNodeId,
            path: [...path, connectedNodeId]
          })
        }
      }
    }

    return null
  }

  // Get detailed port connection information
  const getPortConnections = (nodeId: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return []

    return node.Ports.map(port => {
      const connectedLink = links.value.find(link => {
        const sourcePortId = typeof link.source === 'object' ? link.source.id : link.source
        const targetPortId = typeof link.target === 'object' ? link.target.id : link.target
        return sourcePortId === port.id || targetPortId === port.id
      })

      if (connectedLink) {
        const sourcePortId = typeof connectedLink.source === 'object' ? connectedLink.source.id : connectedLink.source
        const targetPortId = typeof connectedLink.target === 'object' ? connectedLink.target.id : connectedLink.target
        const remotePortId = sourcePortId === port.id ? targetPortId : sourcePortId
        const remotePort = getAllPorts().find(p => p.id === remotePortId)
        const remoteNode = remotePort ? nodes.value.find(n => n.id === remotePort.deviceId) : null

        return {
          localPort: port,
          remotePort: remotePort,
          remoteNode: remoteNode,
          link: connectedLink,
          connectionType: connectedLink.type,
          bandwidth: {
            max: connectedLink.maxBandwidth,
            current: connectedLink.currentBandwidth,
            usage: connectedLink.maxBandwidth > 0 ? (connectedLink.currentBandwidth / connectedLink.maxBandwidth) * 100 : 0
          }
        }
      }

      return {
        localPort: port,
        remotePort: null,
        remoteNode: null,
        link: null,
        connectionType: null,
        bandwidth: null
      }
    })
  }

  // Get connected devices for a specific node
  const getConnectedDevices = (nodeId: string) => {
    const connections = getPortConnections(nodeId)
    return connections
      .filter(conn => conn.remoteNode)
      .map(conn => ({
        device: conn.remoteNode!,
        localPort: conn.localPort,
        remotePort: conn.remotePort!,
        connectionType: conn.connectionType,
        bandwidth: conn.bandwidth,
        link: conn.link
      }))
  }

  // Find detailed path with port information
  const findDetailedPathBetweenNodes = (startNodeId: string, endNodeId: string) => {
    const visited = new Set<string>()
    const queue: {
      nodeId: string;
      path: Array<{
        nodeId: string;
        nodeName: string;
        localPort?: Port;
        remotePort?: Port;
        link?: Link;
      }>
    }[] = [{
      nodeId: startNodeId,
      path: [{
        nodeId: startNodeId,
        nodeName: nodes.value.find(n => n.id === startNodeId)?.name || startNodeId
      }]
    }]

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!

      if (nodeId === endNodeId) {
        return path
      }

      if (visited.has(nodeId)) {
        continue
      }

      visited.add(nodeId)

      // Find all connected nodes through port connections with detailed info
      const connections = getConnectedDevices(nodeId)

      for (const connection of connections) {
        const connectedNodeId = connection.device.id
        if (!visited.has(connectedNodeId)) {
          const newPath = [...path, {
            nodeId: connectedNodeId,
            nodeName: connection.device.name,
            localPort: connection.localPort,
            remotePort: connection.remotePort,
            link: connection.link || undefined
          }]

          queue.push({
            nodeId: connectedNodeId,
            path: newPath
          })
        }
      }
    }

    return null
  }

  // Find ISP nodes in the network
  const ispNodes = computed(() => {
    return nodes.value.filter(node => node.type === 'isp')
  })

  // Initialize with default topology
  const initialize = async () => {
    await fetchTopologies()
    if (topologyTabs.value.length > 0) {
      activeTab.value = topologyTabs.value[0].id
      await fetchTopologyData(activeTab.value)
    }
  }

  return {
    nodes,
    links,
    activeTab,
    topologyTabs,
    isLoading,
    error,
    handleTabChange,
    refreshTopology,
    refreshBandwidthData,
    isRefreshingBandwidth,
    refreshProgress,
    refreshErrors,
    getLinkBandwidth,
    ispNodes,
    initialize,
    getNodeIdFromPortId,
    getAllPorts,
    findPathBetweenNodes,
    getPortConnections,
    getConnectedDevices,
    findDetailedPathBetweenNodes
  }
}
