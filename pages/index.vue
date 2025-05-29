<template>
  <UContainer class="py-8">
    <NetworkHeader @refresh="refreshTopology" />

    <NetworkStatsGrid :nodes="nodes" :links="links" />

    <TopologyTabs
      :tabs="topologyTabs"
      v-model="activeTab"
      :nodes="nodes"
      :links="links"
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
  refreshTopology,
  getLinkBandwidth,
  ispNodes,
  initialize
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

// Provide getLinkBandwidth function to child components
provide('getLinkBandwidth', getLinkBandwidth)

// Initialize with San Luis topology
onMounted(() => {
  console.log("Component mounted")
  setTimeout(() => {
    initialize()
  }, 100) // Small delay to ensure DOM is ready
})



</script>