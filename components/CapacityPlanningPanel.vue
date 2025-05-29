<template>
  <div class="mb-4">
    <h3 class="font-bold mb-2 border-b pb-1">Capacity Planning</h3>

    <!-- New Node Configuration -->
    <div class="mb-4 p-3 bg-blue-50 rounded">
      <h4 class="font-medium mb-2">Add New Node</h4>
      <div class="space-y-2">
        <div>
          <label class="block text-xs font-medium mb-1">Node Name</label>
          <input
            :value="newNodeName"
            @input="$emit('update:newNodeName', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-2 py-1 text-sm border rounded"
            placeholder="Enter node name"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">Node Type</label>
          <select 
            :value="newNodeType" 
            @change="$emit('update:newNodeType', ($event.target as HTMLSelectElement).value)"
            class="w-full px-2 py-1 text-sm border rounded"
          >
            <option value="router">Router</option>
            <option value="switch">Switch</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">Required Capacity (Mbps)</label>
          <input
            :value="newNodeCapacity"
            @input="$emit('update:newNodeCapacity', Number(($event.target as HTMLInputElement).value))"
            type="number"
            class="w-full px-2 py-1 text-sm border rounded"
            placeholder="e.g., 100"
            min="1"
          />
        </div>
        <button
          @click="$emit('calculate-capacity')"
          class="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          :disabled="!newNodeName || !newNodeCapacity"
        >
          Calculate Best Routes
        </button>
      </div>
    </div>

    <!-- Capacity Analysis Results -->
    <div v-if="capacityAnalysis.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
      <h4 class="font-medium text-sm">Route Analysis Results:</h4>
      <div
        v-for="(analysis, index) in capacityAnalysis"
        :key="index"
        class="p-2 rounded text-sm"
        :class="{
          'bg-green-100 border-green-300': analysis.feasible,
          'bg-red-100 border-red-300': !analysis.feasible,
          'bg-yellow-100 border-yellow-300': analysis.needsUpgrade
        }"
      >
        <div class="font-medium flex items-center justify-between">
          <span>{{ analysis.routeName }}</span>
          <span 
            class="text-xs px-2 py-1 rounded"
            :class="{
              'bg-green-200 text-green-800': analysis.feasible && !analysis.needsUpgrade,
              'bg-yellow-200 text-yellow-800': analysis.needsUpgrade,
              'bg-red-200 text-red-800': !analysis.feasible
            }"
          >
            {{ analysis.status }}
          </span>
        </div>
        <div class="text-xs mt-1">
          Path: {{ analysis.path }}
        </div>
        <div class="text-xs">
          Total Cost: {{ analysis.totalCost }}
        </div>
        <div v-if="analysis.bottlenecks.length > 0" class="text-xs mt-1">
          <span class="font-medium">Bottlenecks:</span>
          <div v-for="bottleneck in analysis.bottlenecks" :key="bottleneck.linkId" class="ml-2">
            • {{ bottleneck.description }} ({{ bottleneck.currentUsage }}% used)
          </div>
        </div>
        <div v-if="analysis.upgrades.length > 0" class="text-xs mt-1">
          <span class="font-medium">Required Upgrades:</span>
          <div v-for="upgrade in analysis.upgrades" :key="upgrade.linkId" class="ml-2">
            • {{ upgrade.description }} → {{ upgrade.newCapacity }} Mbps
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

defineProps<Props>()

defineEmits<{
  'update:newNodeName': [value: string]
  'update:newNodeType': [value: string]
  'update:newNodeCapacity': [value: number]
  'calculate-capacity': []
}>()
</script>
