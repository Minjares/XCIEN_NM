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

  const topologyTabs: TopologyTab[] = [
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

  const generatePiedrasNegrasTopology = () => {
    console.log("Generating San Luis topology")
    nodes.value = [
      {
        id: '1433',
        name: 'Core Acuña',
        type: 'router',
        Ports: [
          { id: '33887', name: 'Ether1-Carrier:Enlace_FibraNet_500M', status: 'active', deviceId: '1433' },
          { id: '33891', name: 'Ether5-SW:Datos_Switch_Netonix', status: 'active', deviceId: '1433' }
        ]
      },
      {
        id: '7388',
        name: 'Core Apolo',
        type: 'router',
        Ports: [
          { id: '253561', name: '	Ether5-BH:Ru_B5c_Apolo_Acuna', status: 'active', deviceId: '7388' },
          { id: '253560', name: 'Ether4-BH:C5C_Apolo-San_Carlos', status: 'active', deviceId: '7388' }
        ]
      },
      {
        id: '7079',
        name: 'Core Sispa',
        type: 'router',
        Ports: [
          { id: '238954', name: 'Ether3-BH:B5C_Piedras_Negras_Principal', status: 'active', deviceId: '7079' },
          { id: '238956', name: 'Ether5-PTP:C5C_SECUNDARIO_PIEDRAS_NEGRAS', status: 'active', deviceId: '7079' },
          { id: '238953', name: 'Ether2-BH:B5C_Sispa-San_Carlos', status: 'active', deviceId: '7079' } ,
          { id: '238952', name: '	Ether1-ETH:Switch_CRS326', status: 'active', deviceId: '7079' }       
        ]
      },
      {
        id: '2793',
        name: 'Core Morelos',
        type: 'router',
        Ports: [
          { id: '65697', name: 'Ether1-PTP:RU_Sispa-Morelos', status: 'active', deviceId: '2793' },
          { id: '65701', name: 'Ether5-BH:C5C_Morelos_Villa Unión', status: 'active', deviceId: '2793' }
        ]
      },
      {
        id: '1071',
        name: 'Core Villa Union',
        type: 'router',
        Ports: [
          { id: '23878', name: 'Ether1-PTP:Ru_Tubo_de_comuniucacion_C5c_a_Morelos', status: 'active', deviceId: '1071' },
          { id: '23879', name: 'Ether2-PTP:MU_A_Mtp_Guerrero', status: 'active', deviceId: '1071' }
        ]
      },
      {
        id: '9116',
        name: 'Core MTP Guerrero',
        type: 'router',
        Ports: [
          { id: 'router6-port1_pn', name: 'GigabitEthernet0/0', status: 'active', deviceId: '9116' }
        ]
      },
      {
        id: '8',
        name: 'Core Border Piedras Negras',
        type: 'router',
        Ports: [
          { id: '105', name: 'Ether1-Carrier:FO/ETH_NRT_FibraNet', status: 'active', deviceId: '8' },
          { id: '103', name: 'sfp-sfpplus1-Carrier:FO_Telefonica_Movistar', status: 'active', deviceId: '8' },
          { id: '106', name: 'Ether2-SW:III_RB3011_Piedras_Negras', status: 'active', deviceId: '8' },
          { id: '107', name: 'Ether3-BH:PTP_Telco_C5c', status: 'active', deviceId: '8' }
        ]
      },
      {
        id: '917',
        name: 'Core Telco',
        type: 'router',
        Ports: [
          { id: '110784', name: 'Ether1-BH:C5c_Piedras_Negras', status: 'active', deviceId: '917' }
        ]
      },
      {
        id: '1432',
        name: 'SW PoE Acuña',
        type: 'switch',
        Ports: [
          { id: '33877', name: 'PTP:B5C_Apolo', status: 'active', deviceId: '1432' },
          { id: 'switch1-port2_pn', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: '1432' },
        ]
      },
      {
        id: 'switch2_pn',
        name: 'SW PoE San Carlos',
        type: 'switch',
        Ports: [
          { id: 'switch2-port1_pn', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch2_pn' },
          { id: 'switch2-port2_pn', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch2_pn' }
        ]
      },
      {
        id: 'switch3_pn',
        name: 'SW RB2011 Sispa',
        type: 'switch',
        Ports: [
          { id: 'switch3-port1_pn', name: 'ether1', status: 'active', deviceId: 'switch3_pn' },
          { id: 'switch3-port2_pn', name: 'ether2', status: 'active', deviceId: 'switch3_pn' }
        ]
      },
      {
        id: 'switch4_pn',
        name: 'SW PoE PDN',
        type: 'switch',
        Ports: [
          { id: 'switch4-port1_pn', name: 'GigabitEthernet1/0/1', status: 'active', deviceId: 'switch4_pn' },
          { id: 'switch4-port2_pn', name: 'GigabitEthernet1/0/2', status: 'active', deviceId: 'switch4_pn' },
          { id: 'switch4-port3_pn', name: 'GigabitEthernet1/0/3', status: 'active', deviceId: 'switch4_pn' }
        ]
      },
      {
        id: 'isp1_pn',
        name: 'Carrier Fibranet',
        type: 'isp',
        Ports: [
          { id: 'isp1-port1_pn', name: 'WAN Interface', status: 'active', deviceId: 'isp1_pn' }
        ]
      },
      {
        id: 'isp2_pn',
        name: 'Carrier Movistar',
        type: 'isp',
        Ports: [
          { id: 'isp2-port1_pn', name: 'WAN Interface', status: 'active', deviceId: 'isp2_pn' }
        ]
      },
      {
        id: 'isp3_pn',
        name: 'Carrier Fibranet',
        type: 'isp',
        Ports: [
          { id: 'isp3-port1_pn', name: 'WAN Interface', status: 'active', deviceId: 'isp3_pn' }
        ]
      }
    ]

    links.value = [
      { id: 'link1', source: 'isp1-port1_pn', target: '33887', type: 'microwave', maxBandwidth: 500, currentBandwidth: 300, value: 1 },
      { id: 'link2', source: '33891', target: 'switch1-port2_pn', type: 'microwave', maxBandwidth: 1000, currentBandwidth: 300, value: 1 },
      { id: 'link3', source: '33877', target: '253561', type: 'microwave', maxBandwidth: 720, currentBandwidth: 500, value: 1 },
      { id: 'link4', source: '253560', target: 'switch2-port1_pn', type: 'microwave', maxBandwidth: 100, currentBandwidth: 20, value: 1 },
      { id: 'link5', source: 'switch2-port2_pn', target: '238953', type: 'microwave', maxBandwidth: 150, currentBandwidth: 30, value: 1 },
      { id: 'link6', source: '238952', target: 'switch3-port1_pn', type: 'microwave', maxBandwidth: 210, currentBandwidth: 20, value: 1 },
      { id: 'link7', source: '238954', target: 'switch4-port1_pn', type: 'microwave', maxBandwidth: 480, currentBandwidth: 200, value: 1 },
      { id: 'link8', source: '238956', target: 'switch4-port2_pn', type: 'microwave', maxBandwidth: 480, currentBandwidth: 200, value: 1 },
      { id: 'link9', source: 'switch3-port2_pn', target: '65697', type: 'microwave', maxBandwidth: 180, currentBandwidth: 20, value: 1 },
      { id: 'link10', source: '65701', target: '23878', type: 'microwave', maxBandwidth: 50, currentBandwidth: 5, value: 1 },
      { id: 'link11', source: '23879', target: 'router6-port1_pn', type: 'microwave', maxBandwidth: 100, currentBandwidth: 20, value: 1 },
      { id: 'link12', source: 'switch4-port3_pn', target: '106', type: 'microwave', maxBandwidth: 480, currentBandwidth: 200, value: 1 },
      { id: 'link13', source: '107', target: '110784', type: 'microwave', maxBandwidth: 210, currentBandwidth: 20, value: 1 },
      { id: 'link14', source: '103', target: 'isp2-port1_pn', type: 'microwave', maxBandwidth: 500, currentBandwidth: 200, value: 1 },
      { id: 'link15', source: '105', target: 'isp3-port1_pn', type: 'microwave', maxBandwidth: 1000, currentBandwidth: 200, value: 1 }
    ]
  }

const generateSanLuisTopology = () => {
    console.log("Generating San Luis topology")
    nodes.value = [
      {
        id: '913',
        name: 'Core Border San Luis',
        type: 'router',
        Ports: [
          { id: '12494', name: 'Carrier Flo Networks', status: 'active', deviceId: '913' },
          { id: '12497', name: 'SW PoE Edificio EME', status: 'active', deviceId: '913' }
        ]
      },
      {
        id: '7110',
        name: 'SW PoE Edificio EME',
        type: 'switch',
        Ports: [
          { id: '239519', name: 'Switch los Matias', status: 'active', deviceId: '7110' },
          { id: '239524', name: 'Switch los Matias', status: 'active', deviceId: '7110' },
          { id: '239528', name: 'Core Carretera 57', status: 'active', deviceId: '7110' }
        ]
      },
      {
        id: '7109',
        name: 'Switch los Matias',
        type: 'switch',
        Ports: [
          { id: '239492', name: 'SW PoE Edificio EME', status: 'active', deviceId: '7109' },
          { id: '239489', name: 'SW PoE Edificio EME', status: 'active', deviceId: '7109' },
          { id: '239491', name: 'WRT Planta los Matias', status: 'active', deviceId: '7109' },
          { id: '239494', name: 'WRT Planta los Matias', status: 'active', deviceId: '7109' }
        ]
      },
      {
        id: '9317',
        name: 'Core Carretera 57',
        type: 'router',
        Ports: [
          { id: '419996', name: 'SW PoE Edificio EME', status: 'active', deviceId: '9317' },
          { id: '419990', name: 'Core San Antonio TRM2', status: 'active', deviceId: '9317' },
          { id: '419987', name: 'Core San Antonio TRM2', status: 'active', deviceId: '9317' }
        ]
      },
      {
        id: '8744',
        name: 'Core San Antonio TRM2',
        type: 'router',
        Ports: [
          { id: '296613', name: 'Core Carretera 57', status: 'active', deviceId: '8744' },
          { id: '296619', name: 'Core Carretera 57', status: 'active', deviceId: '8744' },
          { id: '296614', name: 'Rep Cerro Gordo', status: 'active', deviceId: '8744' }
        ]
      },
      {
        id: '5732',
        name: 'Rep Cerro Gordo',
        type: 'router',
        Ports: [
          { id: '185618', name: 'Core San Antonio TRM2', status: 'active', deviceId: '5732' }
        ]
      },
      {
        id: 'wrt1_sl',
        name: 'WRT Planta los Matias',
        type: 'router',
        Ports: [
          { id: 'wrt1-port1_sl', name: 'WAN Interface', status: 'active', deviceId: 'wrt1_sl' },
          { id: 'wrt1-port2_sl', name: 'WAN Interface', status: 'active', deviceId: 'wrt1_sl' }
        ]
      },
      {
        id: 'isp1_sl',
        name: 'Carrier Flo Networks',
        type: 'isp',
        Ports: [
          { id: 'isp1-port1_sl', name: 'WAN Interface', status: 'active', deviceId: 'isp1_sl' }
        ]
      }
    ]

    links.value = [
      // ISP Connection
      { id: 'link1', source: 'isp1-port1_sl', target: '12494', type: 'fiber', maxBandwidth: 700, currentBandwidth: 100, value: 1 },

      // Core Border San Luis to SW PoE Edificio EME
      { id: 'link2', source: '12497', target: '239519', type: 'fiber', maxBandwidth: 1000, currentBandwidth: 200, value: 1 },

      // SW PoE Edificio EME to Switch los Matias (double connection)
      { id: 'link3', source: '239519', target: '239492', type: 'microwave', maxBandwidth: 160, currentBandwidth: 20, value: 1 },
      { id: 'link4', source: '239524', target: '239489', type: 'microwave', maxBandwidth: 180, currentBandwidth: 10, value: 1 },

      // SW PoE Edificio EME to Core Carretera 57
      { id: 'link5', source: '239528', target: '419996', type: 'fiber', maxBandwidth: 700, currentBandwidth: 200, value: 1 },

      // Switch los Matias to WRT Planta los Matias (double connection)
      { id: 'link6', source: '239491', target: 'wrt1-port1_sl', type: 'microwave', maxBandwidth: 100, currentBandwidth: 50, value: 1 },
      { id: 'link7', source: '239494', target: 'wrt1-port2_sl', type: 'microwave', maxBandwidth: 100, currentBandwidth: 45, value: 1 },

      // Core Carretera 57 to Core San Antonio TRM2 (double connection)
      { id: 'link8', source: '419990', target: '296613', type: 'microwave', maxBandwidth: 1800, currentBandwidth: 300, value: 1 },
      { id: 'link9', source: '419987', target: '296619', type: 'microwave', maxBandwidth: 390, currentBandwidth: 250, value: 1 },

      // Core San Antonio TRM2 to Rep Cerro Gordo
      { id: 'link10', source: '296614', target: '185618', type: 'microwave', maxBandwidth: 180, currentBandwidth: 100, value: 1 }
    ]
  }

  const handleTabChange = (tabId: string) => {
    console.log("Tab changed to:", tabId)
    activeTab.value = tabId
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
