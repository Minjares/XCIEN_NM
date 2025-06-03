export interface Port {
  id: string
  name: string
  status: 'active' | 'inactive' | 'error'
  deviceId: string
}

export interface Node {
  id: string
  name: string
  type: 'router' | 'switch' | 'isp'
  Ports: Port[]
}

export interface Link {
  id: string
  source: string | Port
  target: string | Port
  type: 'fiber' | 'microwave'
  maxBandwidth: number
  currentBandwidth: number
  value?: number // Keep for D3 compatibility
}

export interface TopologyTab {
  id: string
  label: string
  description: string
  icon: string
}

export const useNetworkTopology = () => {
  const nodes = ref<Node[]>([])
  const links = ref<Link[]>([])
  const activeTab = ref("sanLuis")

  const topologyTabs: TopologyTab[] = [
    {
      id: "sanLuis",
      label: "San Luis",
      description: "Network topology for San Luis region",
      icon: "i-heroicons-map",
    },
    {
      id: "piedrasNegras",
      label: "Piedras Negras",
      description: "Network topology for Piedras Negras region",
      icon: "i-heroicons-map-pin",
    },
  ]

  const generateSanLuisTopology = () => {
    console.log("Generating San Luis topology")
    nodes.value = [
      {
        id: 'router1',
        name: 'Core Acuña',
        type: 'router',
        Ports: [
          { id: 'router1-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router1' },
          { id: 'router1-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router1' },
          { id: 'router1-port3', name: 'GigabitEthernet0/2', status: 'active', deviceId: 'router1' }
        ]
      },
      {
        id: 'router2',
        name: 'Core Apolo',
        type: 'router',
        Ports: [
          { id: 'router2-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router2' },
          { id: 'router2-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router2' },
          { id: 'router2-port3', name: 'GigabitEthernet0/2', status: 'active', deviceId: 'router2' }
        ]
      },
      {
        id: 'router3',
        name: 'Core Sispa',
        type: 'router',
        Ports: [
          { id: 'router3-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router3' },
          { id: 'router3-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router3' },
          { id: 'router3-port3', name: 'GigabitEthernet0/2', status: 'active', deviceId: 'router3' },
          { id: 'router3-port4', name: 'GigabitEthernet0/3', status: 'active', deviceId: 'router3' }
        ]
      },
      {
        id: 'router4',
        name: 'Core Morelos',
        type: 'router',
        Ports: [
          { id: 'router4-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router4' },
          { id: 'router4-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router4' }
        ]
      },
      {
        id: 'router5',
        name: 'Core Villa Union',
        type: 'router',
        Ports: [
          { id: 'router5-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router5' },
          { id: 'router5-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router5' }
        ]
      },
      {
        id: 'router6',
        name: 'Core MTP Guerrero',
        type: 'router',
        Ports: [
          { id: 'router6-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router6' }
        ]
      },
      {
        id: 'router7',
        name: 'Core Border Piedras Negras',
        type: 'router',
        Ports: [
          { id: 'router7-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router7' },
          { id: 'router7-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router7' },
          { id: 'router7-port3', name: 'GigabitEthernet0/2', status: 'active', deviceId: 'router7' },
          { id: 'router7-port4', name: 'GigabitEthernet0/3', status: 'active', deviceId: 'router7' }
        ]
      },
      {
        id: 'router8',
        name: 'Core Border Telco',
        type: 'router',
        Ports: [
          { id: 'router8-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router8' }
        ]
      },
      {
        id: 'switch1',
        name: 'SW PoE Acuña',
        type: 'switch',
        Ports: [
          { id: 'switch1-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port3', name: 'GigabitEthernet1/0/3', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port4', name: 'GigabitEthernet1/0/4', status: 'active', deviceId: 'switch1' }
        ]
      },
      {
        id: 'switch2',
        name: 'SW PoE San Carlos',
        type: 'switch',
        Ports: [
          { id: 'switch2-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch2' },
          { id: 'switch2-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch2' }
        ]
      },
      {
        id: 'switch3',
        name: 'SW RB2011 Sispa',
        type: 'switch',
        Ports: [
          { id: 'switch3-port1', name: 'ether1', status: 'active', deviceId: 'switch3' },
          { id: 'switch3-port2', name: 'ether2', status: 'active', deviceId: 'switch3' }
        ]
      },
      {
        id: 'switch4',
        name: 'SW PoE PDN',
        type: 'switch',
        Ports: [
          { id: 'switch4-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch4' },
          { id: 'switch4-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch4' },
          { id: 'switch4-port3', name: 'GigabitEthernet1/0/3', status: 'active', deviceId: 'switch4' }
        ]
      },
      {
        id: 'isp1',
        name: 'Carrier Fibranet',
        type: 'isp',
        Ports: [
          { id: 'isp1-port1', name: 'WAN Interface', status: 'active', deviceId: 'isp1' }
        ]
      },
      {
        id: 'isp2',
        name: 'Carrier Movistar',
        type: 'isp',
        Ports: [
          { id: 'isp2-port1', name: 'WAN Interface', status: 'active', deviceId: 'isp2' }
        ]
      },
      {
        id: 'isp3',
        name: 'Carrier Fibranet',
        type: 'isp',
        Ports: [
          { id: 'isp3-port1', name: 'WAN Interface', status: 'active', deviceId: 'isp3' }
        ]
      }
    ]

    links.value = [
      { id: 'link1', source: 'isp1-port1', target: 'router1-port1', type: 'fiber', maxBandwidth: 500, currentBandwidth: 300, value: 1 },
      { id: 'link2', source: 'router1-port2', target: 'switch1-port1', type: 'fiber', maxBandwidth: 720, currentBandwidth: 300, value: 1 },
      { id: 'link3', source: 'switch1-port2', target: 'router2-port1', type: 'fiber', maxBandwidth: 720, currentBandwidth: 500, value: 1 },
      { id: 'link4', source: 'router2-port2', target: 'switch2-port1', type: 'fiber', maxBandwidth: 100, currentBandwidth: 20, value: 1 },
      { id: 'link5', source: 'switch2-port2', target: 'router3-port1', type: 'fiber', maxBandwidth: 150, currentBandwidth: 30, value: 1 },
      { id: 'link6', source: 'router3-port2', target: 'switch3-port1', type: 'fiber', maxBandwidth: 210, currentBandwidth: 20, value: 1 },
      { id: 'link7', source: 'router3-port3', target: 'switch4-port1', type: 'fiber', maxBandwidth: 480, currentBandwidth: 200, value: 1 },
      { id: 'link8', source: 'switch4-port2', target: 'router4-port1', type: 'fiber', maxBandwidth: 180, currentBandwidth: 20, value: 1 },
      { id: 'link9', source: 'router4-port2', target: 'router5-port1', type: 'microwave', maxBandwidth: 50, currentBandwidth: 5, value: 1 },
      { id: 'link10', source: 'router5-port2', target: 'router6-port1', type: 'microwave', maxBandwidth: 100, currentBandwidth: 20, value: 1 },
      { id: 'link11', source: 'switch4-port3', target: 'router7-port1', type: 'fiber', maxBandwidth: 480, currentBandwidth: 200, value: 1 },
      { id: 'link12', source: 'router7-port2', target: 'router8-port1', type: 'fiber', maxBandwidth: 210, currentBandwidth: 20, value: 1 },
      { id: 'link13', source: 'router7-port3', target: 'isp2-port1', type: 'fiber', maxBandwidth: 500, currentBandwidth: 200, value: 1 },
      { id: 'link14', source: 'router7-port4', target: 'isp3-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 200, value: 1 }
    ]
  }

  const generatePiedrasNegrasTopology = () => {
    console.log("Generating Piedras Negras topology")
    nodes.value = [
      {
        id: 'router1',
        name: 'PN-Router-Principal',
        type: 'router',
        Ports: [
          { id: 'router1-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router1' },
          { id: 'router1-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router1' }
        ]
      },
      {
        id: 'router2',
        name: 'PN-Router-Backup',
        type: 'router',
        Ports: [
          { id: 'router2-port1', name: 'GigabitEthernet0/0', status: 'active', deviceId: 'router2' },
          { id: 'router2-port2', name: 'GigabitEthernet0/1', status: 'active', deviceId: 'router2' }
        ]
      },
      {
        id: 'switch1',
        name: 'PN-Switch-Core',
        type: 'switch',
        Ports: [
          { id: 'switch1-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port3', name: 'GigabitEthernet1/0/3', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port4', name: 'GigabitEthernet1/0/4', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port5', name: 'GigabitEthernet1/0/5', status: 'active', deviceId: 'switch1' },
          { id: 'switch1-port6', name: 'GigabitEthernet1/0/6', status: 'active', deviceId: 'switch1' }
        ]
      },
      {
        id: 'switch2',
        name: 'PN-Switch-Zona1',
        type: 'switch',
        Ports: [
          { id: 'switch2-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch2' },
          { id: 'switch2-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch2' }
        ]
      },
      {
        id: 'switch3',
        name: 'PN-Switch-Zona2',
        type: 'switch',
        Ports: [
          { id: 'switch3-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch3' },
          { id: 'switch3-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch3' }
        ]
      },
      {
        id: 'switch4',
        name: 'PN-Switch-Zona3',
        type: 'switch',
        Ports: [
          { id: 'switch4-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch4' },
          { id: 'switch4-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch4' }
        ]
      },
      {
        id: 'switch5',
        name: 'PN-Switch-Zona4',
        type: 'switch',
        Ports: [
          { id: 'switch5-port1', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch5' },
          { id: 'switch5-port2', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch5' }
        ]
      },
      {
        id: 'isp1',
        name: 'Telmex',
        type: 'isp',
        Ports: [
          { id: 'isp1-port1', name: 'WAN Interface', status: 'active', deviceId: 'isp1' }
        ]
      },
      {
        id: 'isp2',
        name: 'AT&T',
        type: 'isp',
        Ports: [
          { id: 'isp2-port1', name: 'WAN Interface', status: 'active', deviceId: 'isp2' }
        ]
      }
    ]

    links.value = [
      { id: 'link1', source: 'router1-port1', target: 'switch1-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 600, value: 1 },
      { id: 'link2', source: 'router2-port1', target: 'switch1-port2', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 200, value: 1 },
      { id: 'link3', source: 'switch1-port3', target: 'switch2-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 300, value: 1 },
      { id: 'link4', source: 'switch1-port4', target: 'switch3-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 400, value: 1 },
      { id: 'link5', source: 'switch1-port5', target: 'switch4-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 350, value: 1 },
      { id: 'link6', source: 'switch1-port6', target: 'switch5-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 250, value: 1 },
      { id: 'link7', source: 'switch2-port2', target: 'switch3-port2', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 100, value: 1 },
      { id: 'link8', source: 'switch3-port2', target: 'switch4-port2', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 150, value: 1 },
      { id: 'link9', source: 'switch4-port2', target: 'switch5-port2', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 200, value: 1 },
      { id: 'link10', source: 'switch5-port2', target: 'switch2-port2', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 180, value: 1 },
      { id: 'link11', source: 'router1-port2', target: 'isp1-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 900, value: 1 },
      { id: 'link12', source: 'router2-port2', target: 'isp2-port1', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 400, value: 1 }
    ]
  }

  const handleTabChange = (tabId: string) => {
    console.log("Tab changed to:", tabId)
    if (tabId === "sanLuis") {
      generateSanLuisTopology()
    } else if (tabId === "piedrasNegras") {
      generatePiedrasNegrasTopology()
    }
  }

  const refreshTopology = () => {
    if (activeTab.value === "sanLuis") {
      generateSanLuisTopology()
    } else if (activeTab.value === "piedrasNegras") {
      generatePiedrasNegrasTopology()
    }
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
  const initialize = () => {
    generateSanLuisTopology()
  }

  return {
    nodes,
    links,
    activeTab,
    topologyTabs,
    generateSanLuisTopology,
    generatePiedrasNegrasTopology,
    handleTabChange,
    refreshTopology,
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
