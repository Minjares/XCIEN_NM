<template>
  <UCard class="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 z-50 shadow-xl max-h-[90vh] overflow-y-auto">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="font-bold text-lg text-gray-800 dark:text-gray-200">{{ selectedNode.name }}</div>
          <UBadge
            :color="selectedNode.type === 'router' ? 'error' : selectedNode.type === 'switch' ? 'info' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1) }}
          </UBadge>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          size="xs"
          color="neutral"
          variant="ghost"
          @click="emit('close')"
          title="Cerrar panel"
        />
      </div>
    </template>

    <CapacityPlanningPanel
      :capacity-analysis="capacityAnalysis"
      :new-node-name="newNodeName"
      :new-node-type="newNodeType"
      :new-node-capacity="newNodeCapacity"
      @update:new-node-name="emit('update:newNodeName', $event)"
      @update:new-node-type="emit('update:newNodeType', $event)"
      @update:new-node-capacity="emit('update:newNodeCapacity', $event)"
      @calculate-capacity="emit('calculateCapacity')"
    />

    <!-- Port Information -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-cpu-chip" class="w-4 h-4 text-primary-500" />
        <h3 class="font-bold text-sm text-gray-400 border-b pb-1 flex-1">Estado de Puertos</h3>
      </div>
      <div v-if="selectedNode.Ports && selectedNode.Ports.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="port in selectedNode.Ports"
          :key="port.id"
          class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm flex items-center justify-between"
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
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ port.name }}</span>
          </div>
          <UBadge
            :color="port.status === 'active' ? 'success' : port.status === 'error' ? 'error' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ port.status }}
          </UBadge>
        </div>
      </div>
      <div v-else class="text-gray-500 dark:text-gray-400 italic text-sm">
        No hay información de puertos disponible
      </div>
    </div>

    <!-- Port Connections -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-link" class="w-4 h-4 text-primary-500" />
        <h3 class="font-bold text-sm border-b pb-1  text-gray-400 flex-1">Conexiones de Puerto</h3>
      </div>
      <div v-if="portConnections.filter(conn => conn.remoteNode).length === 0" class="text-gray-500 dark:text-gray-400 italic text-sm">
        No hay dispositivos conectados
      </div>
      <div v-else class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="connection in portConnections.filter(conn => conn.remoteNode)"
          :key="connection.localPort.id"
          class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          @click.stop="emit('selectNode', connection.remoteNode)"
        >
          <!-- Connection Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-2"
                :class="{
                  'bg-red-500': connection.remoteNode.type === 'router',
                  'bg-blue-500': connection.remoteNode.type === 'switch',
                  'bg-yellow-500': connection.remoteNode.type === 'isp'
                }"
              ></div>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{ connection.remoteNode.name }}</span>
              <UBadge
                :color="connection.remoteNode.type === 'router' ? 'error' : connection.remoteNode.type === 'switch' ? 'info' : 'warning'"
                variant="subtle"
                size="xs"
                class="ml-2"
              >
                {{ connection.remoteNode.type }}
              </UBadge>
            </div>
          </div>

          <!-- Port Connection Details -->
          <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div class="flex items-center">
              <span class="font-medium text-blue-600 dark:text-blue-400">{{ connection.localPort.name }}</span>
              <span class="mx-2">→</span>
              <span class="font-medium text-green-600 dark:text-green-400">{{ connection.remotePort?.name }}</span>
            </div>

            <!-- Connection Type -->
            <div class="flex items-center space-x-2">
              <span class="text-gray-500 dark:text-gray-400">Tipo:</span>
              <UBadge
                :color="connection.connectionType === 'fiber' ? 'primary' : 'secondary'"
                variant="subtle"
                size="xs"
              >
                {{ connection.connectionType }}
              </UBadge>
            </div>

            <!-- Bandwidth Info -->
            <div v-if="connection.bandwidth" class="flex items-center justify-between">
              <span class="text-gray-500 dark:text-gray-400">Ancho de banda:</span>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-700 dark:text-gray-300">
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
  </UCard>
</template>

<script setup lang="ts">
import type { Node } from '~/types/network'

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
  'close': []
}>()

// Computed property for port connections
const portConnections = computed(() => {
  if (!props.selectedNode || !props.getPortConnections) return []
  return props.getPortConnections(props.selectedNode.id)
})
</script>