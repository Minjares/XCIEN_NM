export interface Node {
  id: string
  name: string
  type: 'router' | 'switch' | 'isp'
}

export interface Link {
  id: string
  source: string | Node
  target: string | Node
  value: number
  maxBandwidth?: number
  currentBandwidth?: number
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
      { id: 'router1', name: 'Core Acuña', type: 'router' },
      { id: 'router2', name: 'Core Apolo', type: 'router' },
      { id: 'router3', name: 'Core Sispa', type: 'router' },
      { id: 'router4', name: 'Core Morelos', type: 'router' },
      { id: 'router5', name: 'Core Villa Union', type: 'router' },
      { id: 'router6', name: 'Core MTP Guerrero', type: 'router' },
      { id: 'router7', name: 'Core Border Piedras Negras', type: 'router' },
      { id: 'router8', name: 'Core Border Telco', type: 'router' },
      { id: 'switch1', name: 'SW PoE Acuña', type: 'switch' },
      { id: 'switch2', name: 'SW PoE San Carlos', type: 'switch' },
      { id: 'switch3', name: 'SW RB2011 Sispa', type: 'switch' },
      { id: 'switch4', name: 'SW PoE PDN', type: 'switch' },
      { id: 'isp1', name: 'Carrier Fibranet', type: 'isp' },
      { id: 'isp2', name: 'Carrier Movistar', type: 'isp' },
      { id: 'isp3', name: 'Carrier Fibranet', type: 'isp' }
    ]

    links.value = [
      { id: 'link1', source: 'isp1', target: 'router1', value: 1, maxBandwidth: 500, currentBandwidth: 300 },
      { id: 'link2', source: 'router1', target: 'switch1', value: 1, maxBandwidth: 720, currentBandwidth: 300 },
      { id: 'link3', source: 'switch1', target: 'router2', value: 1, maxBandwidth: 720, currentBandwidth: 500 },
      { id: 'link4', source: 'router2', target: 'switch2', value: 1, maxBandwidth: 100, currentBandwidth: 20 },
      { id: 'link5', source: 'switch2', target: 'router3', value: 1, maxBandwidth: 150, currentBandwidth: 30 },
      { id: 'link6', source: 'router3', target: 'switch3', value: 1, maxBandwidth: 210, currentBandwidth: 20 },
      { id: 'link7', source: 'router3', target: 'switch4', value: 1, maxBandwidth: 480, currentBandwidth: 200 },
      { id: 'link8', source: 'switch4', target: 'router4', value: 1, maxBandwidth: 180, currentBandwidth: 20 },
      { id: 'link9', source: 'router4', target: 'router5', value: 1, maxBandwidth: 50, currentBandwidth: 5 },
      { id: 'link10', source: 'router5', target: 'router6', value: 1, maxBandwidth: 100, currentBandwidth: 20 },
      { id: 'link11', source: 'switch4', target: 'router7', value: 1, maxBandwidth: 480, currentBandwidth: 200 },
      { id: 'link12', source: 'router7', target: 'router8', value: 1, maxBandwidth: 210, currentBandwidth: 20 },
      { id: 'link13', source: 'router7', target: 'isp2', value: 1, maxBandwidth: 500, currentBandwidth: 200 },
      { id: 'link14', source: 'router7', target: 'isp3', value: 1, maxBandwidth: 1000, currentBandwidth: 200 }
    ]
  }

  const generatePiedrasNegrasTopology = () => {
    console.log("Generating Piedras Negras topology")
    nodes.value = [
      { id: 'router1', name: 'PN-Router-Principal', type: 'router' },
      { id: 'router2', name: 'PN-Router-Backup', type: 'router' },
      { id: 'switch1', name: 'PN-Switch-Core', type: 'switch' },
      { id: 'switch2', name: 'PN-Switch-Zona1', type: 'switch' },
      { id: 'switch3', name: 'PN-Switch-Zona2', type: 'switch' },
      { id: 'switch4', name: 'PN-Switch-Zona3', type: 'switch' },
      { id: 'switch5', name: 'PN-Switch-Zona4', type: 'switch' },
      { id: 'isp1', name: 'Telmex', type: 'isp' },
      { id: 'isp2', name: 'AT&T', type: 'isp' }
    ]

    links.value = [
      { id: 'link1', source: 'router1', target: 'switch1', value: 1, maxBandwidth: 1000, currentBandwidth: 600 },
      { id: 'link2', source: 'router2', target: 'switch1', value: 1, maxBandwidth: 1000, currentBandwidth: 200 },
      { id: 'link3', source: 'switch1', target: 'switch2', value: 1, maxBandwidth: 1000, currentBandwidth: 300 },
      { id: 'link4', source: 'switch1', target: 'switch3', value: 1, maxBandwidth: 1000, currentBandwidth: 400 },
      { id: 'link5', source: 'switch1', target: 'switch4', value: 1, maxBandwidth: 1000, currentBandwidth: 350 },
      { id: 'link6', source: 'switch1', target: 'switch5', value: 1, maxBandwidth: 1000, currentBandwidth: 250 },
      { id: 'link7', source: 'switch2', target: 'switch3', value: 1, maxBandwidth: 1000, currentBandwidth: 100 },
      { id: 'link8', source: 'switch3', target: 'switch4', value: 1, maxBandwidth: 1000, currentBandwidth: 150 },
      { id: 'link9', source: 'switch4', target: 'switch5', value: 1, maxBandwidth: 1000, currentBandwidth: 200 },
      { id: 'link10', source: 'switch5', target: 'switch2', value: 1, maxBandwidth: 1000, currentBandwidth: 180 },
      { id: 'link11', source: 'router1', target: 'isp1', value: 1, maxBandwidth: 1000, currentBandwidth: 900 },
      { id: 'link12', source: 'router2', target: 'isp2', value: 1, maxBandwidth: 1000, currentBandwidth: 400 }
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
    initialize
  }
}
