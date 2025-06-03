<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ selectedNode?.name || 'No Device Selected' }} - Port Details
    </h3>
    
    <div v-if="selectedNode" class="space-y-4">
      <!-- Device Info -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-sm font-medium text-gray-500">Device Type:</span>
            <span class="ml-2 text-sm text-gray-900 capitalize">{{ selectedNode.type }}</span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500">Total Ports:</span>
            <span class="ml-2 text-sm text-gray-900">{{ selectedNode.Ports.length }}</span>
          </div>
        </div>
      </div>

      <!-- Port Connections -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-3">Port Connections</h4>
        <div class="space-y-3">
          <div 
            v-for="connection in portConnections" 
            :key="connection.localPort.id"
            class="border rounded-lg p-4"
            :class="{
              'border-green-200 bg-green-50': connection.remoteNode,
              'border-gray-200 bg-gray-50': !connection.remoteNode
            }"
          >
            <!-- Local Port Info -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="{
                    'bg-green-500': connection.localPort.status === 'active',
                    'bg-red-500': connection.localPort.status === 'error',
                    'bg-gray-400': connection.localPort.status === 'inactive'
                  }"
                ></div>
                <span class="font-medium text-gray-900">{{ connection.localPort.name }}</span>
                <span 
                  class="px-2 py-1 text-xs rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': connection.localPort.status === 'active',
                    'bg-red-100 text-red-800': connection.localPort.status === 'error',
                    'bg-gray-100 text-gray-800': connection.localPort.status === 'inactive'
                  }"
                >
                  {{ connection.localPort.status }}
                </span>
              </div>
            </div>

            <!-- Connection Details -->
            <div v-if="connection.remoteNode" class="space-y-2">
              <!-- Remote Device -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Icon name="heroicons:arrow-right" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm font-medium text-gray-700">Connected to:</span>
                  <span class="text-sm text-gray-900">{{ connection.remoteNode.name }}</span>
                  <span 
                    class="px-2 py-1 text-xs rounded-full capitalize"
                    :class="{
                      'bg-red-100 text-red-800': connection.remoteNode.type === 'router',
                      'bg-blue-100 text-blue-800': connection.remoteNode.type === 'switch',
                      'bg-yellow-100 text-yellow-800': connection.remoteNode.type === 'isp'
                    }"
                  >
                    {{ connection.remoteNode.type }}
                  </span>
                </div>
              </div>

              <!-- Remote Port -->
              <div class="flex items-center space-x-2 ml-6">
                <span class="text-sm text-gray-500">Port:</span>
                <span class="text-sm text-gray-900">{{ connection.remotePort?.name }}</span>
              </div>

              <!-- Connection Type -->
              <div class="flex items-center space-x-2 ml-6">
                <span class="text-sm text-gray-500">Type:</span>
                <span 
                  class="px-2 py-1 text-xs rounded-full capitalize"
                  :class="{
                    'bg-blue-100 text-blue-800': connection.connectionType === 'fiber',
                    'bg-purple-100 text-purple-800': connection.connectionType === 'microwave'
                  }"
                >
                  {{ connection.connectionType }}
                </span>
              </div>

              <!-- Bandwidth Info -->
              <div v-if="connection.bandwidth" class="ml-6">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-500">Bandwidth Usage:</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ connection.bandwidth.current }}/{{ connection.bandwidth.max }} Mbps
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="{
                      'bg-green-500': connection.bandwidth.usage < 50,
                      'bg-yellow-500': connection.bandwidth.usage >= 50 && connection.bandwidth.usage < 80,
                      'bg-red-500': connection.bandwidth.usage >= 80
                    }"
                    :style="{ width: `${Math.min(connection.bandwidth.usage, 100)}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ Math.round(connection.bandwidth.usage) }}% utilized
                </div>
              </div>
            </div>

            <!-- Unconnected Port -->
            <div v-else class="text-sm text-gray-500 ml-6">
              <Icon name="heroicons:x-mark" class="w-4 h-4 inline mr-1" />
              No connection
            </div>
          </div>
        </div>
      </div>

      <!-- Connected Devices Summary -->
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-md font-medium text-gray-900 mb-2">Connected Devices Summary</h4>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ connectedDevices.length }}</div>
            <div class="text-sm text-gray-600">Connected</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-600">{{ availablePorts }}</div>
            <div class="text-sm text-gray-600">Available</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ activePorts }}</div>
            <div class="text-sm text-gray-600">Active</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <Icon name="heroicons:cpu-chip" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">Select a device to view port details</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '~/composables/useNetworkTopology'

interface Props {
  selectedNode: Node | null
  getPortConnections: (nodeId: string) => any[]
  getConnectedDevices: (nodeId: string) => any[]
}

const props = defineProps<Props>()

// Computed properties for port connections and device info
const portConnections = computed(() => {
  if (!props.selectedNode) return []
  return props.getPortConnections(props.selectedNode.id)
})

const connectedDevices = computed(() => {
  if (!props.selectedNode) return []
  return props.getConnectedDevices(props.selectedNode.id)
})

const availablePorts = computed(() => {
  if (!props.selectedNode) return 0
  return props.selectedNode.Ports.length - connectedDevices.value.length
})

const activePorts = computed(() => {
  if (!props.selectedNode) return 0
  return props.selectedNode.Ports.filter(port => port.status === 'active').length
})
</script>
