<template>
  <div class="mb-4">
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-primary-500" />
      <h3 class="font-bold text-gray-400 text-sm border-b pb-1 flex-1">Planificación de Capacidad</h3>
    </div>

    <!-- New Node Configuration -->
    <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Agregar Nuevo Nodo</h4>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Nombre del Nodo</label>
          <UInput
            v-model="localNodeName"
            placeholder="Ej: Router-Principal-01"
            icon="i-heroicons-server"
            size="xs"
          />
        </div>

        <div>
          <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Tipo de Nodo</label>
          <USelect
            v-model="nodeTypeValue"
            :items="nodeTypeItems"
            size="xs"
          />
        </div>

        <div>
          <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Capacidad Requerida (Mbps)</label>
          <UInput
            v-model="localNodeCapacity"
            type="number"
            placeholder="100"
            icon="i-heroicons-signal"
            size="xs"
            :min="1"
          />
        </div>

        <UButton
          @click="handleCalculate"
          color="primary"
          variant="solid"
          size="xs"
          :disabled="!localNodeName || !localNodeCapacity"
          block
          icon="i-heroicons-calculator"
        >
          Calcular Mejores Rutas
        </UButton>
      </div>
    </div>

    <!-- Capacity Analysis Results -->
    <div v-if="capacityAnalysis.length > 0">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-primary-500" />
        <h4 class="font-bold text-sm border-b pb-1 flex-1">Resultados del Análisis</h4>
      </div>

      <div class="max-h-48 overflow-y-auto space-y-2">
        <div
          v-for="(analysis, index) in capacityAnalysis"
          :key="index"
          class="p-2 rounded-lg text-xs border"
          :class="{
            'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700': analysis.feasible && !analysis.needsUpgrade,
            'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700': analysis.needsUpgrade,
            'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700': !analysis.feasible
          }"
        >
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium">{{ analysis.routeName }}</span>
              <UBadge
                :color="analysis.feasible && !analysis.needsUpgrade ? 'success' : analysis.needsUpgrade ? 'warning' : 'error'"
                variant="subtle"
                size="xs"
              >
                {{ analysis.status }}
              </UBadge>
            </div>

            <div class="text-xs text-gray-600 dark:text-gray-400">
              <div><strong>Ruta:</strong> {{ analysis.path }}</div>
              <div><strong>Costo:</strong> {{ analysis.totalCost }}</div>
            </div>

            <div v-if="analysis.bottlenecks.length > 0" class="text-xs">
              <div class="font-medium text-yellow-700 dark:text-yellow-300">Cuellos de Botella:</div>
              <div v-for="bottleneck in analysis.bottlenecks" :key="bottleneck.linkId" class="ml-2 text-gray-600 dark:text-gray-400">
                • {{ bottleneck.description }} ({{ bottleneck.currentUsage }}%)
              </div>
            </div>

            <div v-if="analysis.upgrades.length > 0" class="text-xs">
              <div class="font-medium text-blue-700 dark:text-blue-300">Actualizaciones:</div>
              <div v-for="upgrade in analysis.upgrades" :key="upgrade.linkId" class="ml-2 text-gray-600 dark:text-gray-400">
                • {{ upgrade.description }} → {{ upgrade.newCapacity }} Mbps
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'

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
  capacityAnalysis: CapacityAnalysis[]
  newNodeName: string
  newNodeType: string
  newNodeCapacity: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:new-node-name': [value: string]
  'update:new-node-type': [value: string]
  'update:new-node-capacity': [value: number]
  'calculate-capacity': []
}>()

// Internal local refs that emit updates
const localNodeName = ref(props.newNodeName)
const localNodeCapacity = ref(props.newNodeCapacity)

watch(localNodeName, (val) => emit('update:new-node-name', val))
watch(localNodeCapacity, (val) => emit('update:new-node-capacity', val))

const nodeTypeItems = [
  { label: 'Router', value: 'router' },
  { label: 'Switch', value: 'switch' }
]

const nodeTypeValue = computed({
  get: () => props.newNodeType,
  set: (value: string) => emit('update:new-node-type', value)
})

const handleCalculate = () => {
  emit('calculate-capacity')
}
</script>
