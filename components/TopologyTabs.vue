<template>
  <div class="mb-6 p-4 bg-gray-100 rounded-lg">
    <UTabs
      :items="tabs"
      :model-value="modelValue"
      @update:model-value="handleTabChange"
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
  value: string
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

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'tab-change': [tabId: string]
}>()

const handleTabChange = (value: string | number) => {
  const stringValue = String(value)
  emit('update:modelValue', stringValue)
  emit('tab-change', stringValue)
}
</script>
