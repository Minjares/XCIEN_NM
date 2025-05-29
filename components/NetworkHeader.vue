<template>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold">Gráfico de Red</h1>
      <p class="text-gray-500 mt-1">Diseño y gestión de la topología de red</p>
    </div>
    <UButton
      icon="i-heroicons-arrow-path"
      color="primary"
      variant="soft"
      @click="$emit('refresh')"
    >
      Actualizar
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  refresh: []
}>()
</script>
