<template>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-white">Gráfico de Red</h1>
      <p class="text-gray-400 mt-1">Diseño y gestión de la topología de red</p>
    </div>
    <div class="flex items-center gap-4">
      <!-- Progress indicator for bandwidth refresh -->
      <div v-if="isRefreshingBandwidth" class="flex items-center gap-2 text-sm text-gray-600">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        <span>Actualizando ancho de banda...</span>
        <span v-if="refreshProgress > 0" class="text-xs">{{ refreshProgress }}%</span>
      </div>

      <!-- Error indicator -->
      <div v-if="refreshErrors.length > 0" class="flex items-center gap-1 text-sm text-red-600">
        <UIcon name="i-heroicons-exclamation-triangle" />
        <span>{{ refreshErrors.length }} errores</span>
      </div>

      <UButton
        icon="i-heroicons-arrow-path"
        color="primary"
        variant="soft"
        :loading="isRefreshingBandwidth"
        @click="$emit('refreshBandwidth')"
      >
        Actualizar
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isRefreshingBandwidth?: boolean
  refreshProgress?: number
  refreshErrors?: readonly string[]
}

withDefaults(defineProps<Props>(), {
  isRefreshingBandwidth: false,
  refreshProgress: 0,
  refreshErrors: () => []
})

defineEmits<{
  refreshBandwidth: []
}>()
</script>
