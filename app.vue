<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
import { onMounted } from 'vue';

// Initialize auth on app mount
onMounted(() => {
  const { initAuth } = useAuth();
  initAuth();
});
</script>
