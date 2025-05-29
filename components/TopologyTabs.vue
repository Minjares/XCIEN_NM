<template>
  <div class="mb-6 p-4 bg-gray-100 rounded-lg">
    <UTabs
      :items="tabs"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event); $emit('tab-change', $event)"
    >
      <template #item="{ item }">
        <div class="p-4">
          <p class="text-sm text-gray-600 mb-2">{{ item.description }}</p>
          <div class="text-sm text-gray-600">
            <p>Nodes: {{ nodes.length }} | Links: {{ links.length }}</p>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
interface TopologyTab {
  id: string
  label: string
  description: string
  icon: string
}

interface Node {
  id: string
  name: string
  type: 'router' | 'switch' | 'isp'
}

interface Link {
  id: string
  source: string | Node
  target: string | Node
  value: number
  maxBandwidth?: number
  currentBandwidth?: number
}

interface Props {
  tabs: TopologyTab[]
  modelValue: string
  nodes: Node[]
  links: Link[]
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
  'tab-change': [tabId: string]
}>()
</script>
