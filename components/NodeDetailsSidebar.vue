<template>
  <div class="absolute top-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
    <div class="flex justify-between items-center mb-4">
      <div class="font-bold text-lg">{{ selectedNode.name }}</div>
      <div
        class="px-2 py-1 rounded text-xs font-medium"
        :class="{
          'bg-red-100 text-red-800': selectedNode.type === 'router',
          'bg-teal-100 text-teal-800': selectedNode.type === 'switch',
          'bg-yellow-100 text-yellow-800': selectedNode.type === 'isp'
        }"
      >
        {{ selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1) }}
      </div>
    </div>

    <CapacityPlanningPanel
      :capacity-analysis="capacityAnalysis"
      :new-node-name="newNodeName"
      :new-node-type="newNodeType"
      :new-node-capacity="newNodeCapacity"
      @update:new-node-name="$emit('update:newNodeName', $event)"
      @update:new-node-type="$emit('update:newNodeType', $event)"
      @update:new-node-capacity="$emit('update:newNodeCapacity', $event)"
      @calculate-capacity="$emit('calculateCapacity')"
    />

    <div>
      <h3 class="font-bold mb-2 border-b pb-1">Connected Devices</h3>
      <div v-if="connectedNodes.length === 0" class="text-gray-500 italic">
        No connected devices
      </div>
      <div v-else class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="node in connectedNodes"
          :key="node.id"
          class="p-2 bg-gray-100 rounded text-sm flex items-center cursor-pointer hover:bg-gray-200"
          @click.stop="$emit('selectNode', node)"
        >
          <div
            class="w-3 h-3 rounded-full mr-2"
            :class="{
              'bg-red-500': node.type === 'router',
              'bg-teal-500': node.type === 'switch',
              'bg-yellow-500': node.type === 'isp'
            }"
          ></div>
          <div>{{ node.name }}</div>
          <div v-if="getBandwidthInfo(node.id)" class="ml-auto text-xs">
            {{ getBandwidthInfo(node.id)?.currentBandwidth }}/{{ getBandwidthInfo(node.id)?.maxBandwidth }} Mbps
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Node {
  id: string
  name: string
  type: 'router' | 'switch' | 'isp'
}

interface CapacityAnalysis {
  routeName: string
  path: string
  feasible: boolean
  needsUpgrade: boolean
  totalCost: number
  bottlenecks: Array<{
    linkId: string
    description: string
    currentUsage: number
  }>
  upgrades: Array<{
    linkId: string
    description: string
    newCapacity: number
  }>
  status: string
}

interface Props {
  selectedNode: Node
  connectedNodes: Node[]
  capacityAnalysis: CapacityAnalysis[]
  newNodeName: string
  newNodeType: string
  newNodeCapacity: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:newNodeName': [value: string]
  'update:newNodeType': [value: string]
  'update:newNodeCapacity': [value: number]
  'calculateCapacity': []
  'selectNode': [node: Node]
}>()

// Inject the getLinkBandwidth function from parent
const getLinkBandwidth = inject<(sourceId: string, targetId: string) => { maxBandwidth: number; currentBandwidth: number } | null>('getLinkBandwidth')

const getBandwidthInfo = (nodeId: string) => {
  if (getLinkBandwidth) {
    return getLinkBandwidth(props.selectedNode.id, nodeId)
  }
  return null
}
</script>
