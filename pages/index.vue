<template>
  <UContainer class="py-8">
    
    <NetworkHeader
      :is-refreshing-bandwidth="isRefreshingBandwidth"
      :refresh-progress="refreshProgress"
      :refresh-errors="refreshErrors"
      @refresh-bandwidth="handleBandwidthRefresh"
    />

    <NetworkStatsGrid :nodes="nodes" :links="links" />

    <TopologyTabs
      :tabs="topologyTabs"
      v-model="activeTab"
      :nodes="nodes"
      @tab-change="handleTabChange"
    />

    <NetworkGraph
      :nodes="nodes"
      :links="links"
      :selected-node="selectedNode"
      @node-selected="selectNode"
      @node-deselected="selectedNode = null"
    />

    <NodeDetailsSidebar
      v-if="selectedNode"
      :selected-node="selectedNode"
      :connected-nodes="connectedNodes"
      :capacity-analysis="capacityAnalysis"
      :new-node-name="newNodeName"
      :new-node-type="newNodeType"
      :new-node-capacity="newNodeCapacity"
      :get-port-connections="getPortConnections"
      @update:new-node-name="newNodeName = $event"
      @update:new-node-type="newNodeType = $event"
      @update:new-node-capacity="newNodeCapacity = $event"
      @calculate-capacity="handleCalculateCapacityPlan"
      @select-node="selectNode"
    />
  </UContainer>
</template>

<script setup lang="ts">
// Define middleware
definePageMeta({
  middleware: ['auth']
})

// Use composables
const {
  nodes,
  links,
  activeTab,
  topologyTabs,
  handleTabChange,
  refreshBandwidthData,
  isRefreshingBandwidth,
  refreshProgress,
  refreshErrors,
  getLinkBandwidth,
  ispNodes,
  initialize,
  getPortConnections
} = useNetworkTopology()

const {
  selectedNode,
  connectedNodes,
  selectNode
} = useNetworkRouting(nodes, links, ispNodes)

const {
  newNodeName,
  newNodeType,
  newNodeCapacity,
  capacityAnalysis,
  calculateCapacityPlan
} = useCapacityPlanning(nodes, links, ispNodes)

// Calculate capacity plan wrapper
const handleCalculateCapacityPlan = () => {
  if (selectedNode.value) {
    calculateCapacityPlan(selectedNode.value)
  }
}

// Handler for bandwidth refresh
const handleBandwidthRefresh = async () => {
  await refreshBandwidthData()
}

provide('getLinkBandwidth', getLinkBandwidth)

onMounted(async () => {
  console.log("Component mounted")
  setTimeout(async () => {
    await initialize()
  }, 100) 
})



</script>