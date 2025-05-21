<template>
  <div class="min-h-screen flex flex-col">
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3">
      <div class="container mx-auto px-4 flex items-center justify-between">
        <NuxtLink to="/dashboard" class="flex items-center">
          <img src="/xcien-logo.svg" alt="XCIEN Logo" class="h-8 mr-2" />
        </NuxtLink>
        
        <UNavigationMenu :items="navigationItems" class="flex-1 justify-center" />
        
        <UButton
          variant="ghost"
          icon="i-heroicons-arrow-right-on-rectangle"
          @click="handleLogout"
        >
          Cerrar Sesión
        </UButton>
      </div>
    </div>
    
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted, computed } from 'vue';
import type { NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();
const { isAuthenticated, logout, initAuth } = useAuth();

const navigationItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-chart-bar',
    to: '/dashboard',
    active: route.path === '/dashboard'
  },
  {
    label: 'Nodos',
    icon: 'i-heroicons-server',
    to: '/',
    active: route.path === '/'
  }
]);

// Initialize auth state
onMounted(() => {
  initAuth();
});

// Handle logout
const handleLogout = () => {
  logout();
  navigateTo('/login');
};
</script>
