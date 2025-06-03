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

    <!-- Port Information -->
    <div class="mb-4">
      <h3 class="font-bold mb-2 border-b pb-1">Port Status</h3>
      <div v-if="selectedNode.Ports && selectedNode.Ports.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="port in selectedNode.Ports"
          :key="port.id"
          class="p-2 bg-gray-50 rounded text-sm flex items-center justify-between"
        >
          <div class="flex items-center">
            <div
              class="w-2 h-2 rounded-full mr-2"
              :class="{
                'bg-green-500': port.status === 'active',
                'bg-red-500': port.status === 'error',
                'bg-gray-400': port.status === 'inactive'
              }"
            ></div>
            <span class="text-xs font-medium">{{ port.name }}</span>
          </div>
          <span
            class="px-1 py-0.5 text-xs rounded"
            :class="{
              'bg-green-100 text-green-800': port.status === 'active',
              'bg-red-100 text-red-800': port.status === 'error',
              'bg-gray-100 text-gray-800': port.status === 'inactive'
            }"
          >
            {{ port.status }}
          </span>
        </div>
      </div>
      <div v-else class="text-gray-500 italic text-sm">
        No port information available
      </div>
    </div>

    <div>
      <h3 class="font-bold mb-2 border-b pb-1">Port Connections</h3>
      <div v-if="portConnections.filter(conn => conn.remoteNode).length === 0" class="text-gray-500 italic">
        No connected devices
      </div>
      <div v-else class="space-y-3 max-h-48 overflow-y-auto">
        <div
          v-for="connection in portConnections.filter(conn => conn.remoteNode)"
          :key="connection.localPort.id"
          class="p-3 bg-gray-100 rounded text-sm cursor-pointer hover:bg-gray-200"
          @click.stop="$emit('selectNode', connection.remoteNode)"
        >
          <!-- Connection Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-2"
                :class="{
                  'bg-red-500': connection.remoteNode.type === 'router',
                  'bg-teal-500': connection.remoteNode.type === 'switch',
                  'bg-yellow-500': connection.remoteNode.type === 'isp'
                }"
              ></div>
              <span class="font-medium">{{ connection.remoteNode.name }}</span>
              <span
                class="ml-2 px-2 py-0.5 text-xs rounded-full capitalize"
                :class="{
                  'bg-red-100 text-red-800': connection.remoteNode.type === 'router',
                  'bg-teal-100 text-teal-800': connection.remoteNode.type === 'switch',
                  'bg-yellow-100 text-yellow-800': connection.remoteNode.type === 'isp'
                }"
              >
                {{ connection.remoteNode.type }}
              </span>
            </div>
          </div>

          <!-- Port Connection Details -->
          <div class="text-xs text-gray-600 space-y-1">
            <div class="flex items-center">
              <span class="font-medium text-blue-600">{{ connection.localPort.name }}</span>
              <span class="mx-2">→</span>
              <span class="font-medium text-green-600">{{ connection.remotePort?.name }}</span>
            </div>

            <!-- Connection Type -->
            <div class="flex items-center space-x-2">
              <span class="text-gray-500">Type:</span>
              <span
                class="px-1 py-0.5 rounded text-xs capitalize"
                :class="{
                  'bg-blue-100 text-blue-800': connection.connectionType === 'fiber',
                  'bg-purple-100 text-purple-800': connection.connectionType === 'microwave'
                }"
              >
                {{ connection.connectionType }}
              </span>
            </div>

            <!-- Bandwidth Info -->
            <div v-if="connection.bandwidth" class="flex items-center justify-between">
              <span class="text-gray-500">Bandwidth:</span>
              <div class="flex items-center space-x-2">
                <span class="font-medium">
                  {{ connection.bandwidth.current }}/{{ connection.bandwidth.max }} Mbps
                </span>
                <div
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-green-500': connection.bandwidth.usage < 50,
                    'bg-yellow-500': connection.bandwidth.usage >= 50 && connection.bandwidth.usage < 80,
                    'bg-red-500': connection.bandwidth.usage >= 80
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Port {
  id: string
  name: string
  status: 'active' | 'inactive' | 'error'
  deviceId: string
}

interface Node {
  id: string
  name: string
  type: 'router' | 'switch' | 'isp'
  Ports: Port[]
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
  getPortConnections: (nodeId: string) => any[]
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

// Computed property for port connections
const portConnections = computed(() => {
  if (!props.selectedNode || !props.getPortConnections) return []
  return props.getPortConnections(props.selectedNode.id)
})

const getBandwidthInfo = (nodeId: string) => {
  if (getLinkBandwidth) {
    return getLinkBandwidth(props.selectedNode.id, nodeId)
  }
  return null
}
</script>
