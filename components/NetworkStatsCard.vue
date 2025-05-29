<template>
  <UCard
    :ui="{ body: { base: 'p-5' } }"
    class="hover:shadow-lg transition-shadow duration-200 border-t-4"
    :class="borderColorClass"
  >
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm text-gray-500 mb-2">{{ title }}</div>
        <div class="text-xl font-semibold flex items-center gap-2">
          {{ value }}
        </div>
      </div>
      <div class="rounded-full p-3" :class="iconBgClass">
        <UIcon
          :name="icon"
          class="w-8 h-8"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number
  icon: string
  color: 'primary' | 'blue' | 'green' | 'yellow' | 'purple'
}

const props = defineProps<Props>()

const borderColorClass = computed(() => {
  const colorMap = {
    primary: 'border-primary-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500'
  }
  return colorMap[props.color]
})

const iconBgClass = computed(() => {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  }
  return colorMap[props.color]
})
</script>
