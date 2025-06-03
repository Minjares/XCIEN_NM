<template>
  <div class="mb-6 p-4 rounded-lg">
    <UTabs
      :items="tabs"
      :model-value="modelValue"
      @update:model-value="handleTabChange"
    >
      
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
