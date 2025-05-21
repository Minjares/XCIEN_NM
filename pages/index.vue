<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Gráfico de Red</h1>
        <p class="text-gray-500 mt-1">Diseño y gestión de la topología de red</p>
      </div>
      <UButton
        icon="i-heroicons-arrow-path"
        color="primary"
        variant="soft"
        @click="loadNetworkFromLocalStorage"
      >
        Actualizar
      </UButton>
    </div>

    <!-- Network Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4 border-primary-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Dispositivos Totales</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ nodes.length }}
            </div>
          </div>
          <div class="rounded-full p-3 bg-primary-100 text-primary-600">
            <UIcon
              name="i-heroicons-device-phone-mobile"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>

      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4 border-blue-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Routers</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ nodes.filter(n => n.type === 'router').length }}
            </div>
          </div>
          <div class="rounded-full p-3 bg-blue-100 text-blue-600">
            <UIcon
              name="i-heroicons-server"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>

      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4 border-green-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Switches</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ nodes.filter(n => n.type === 'switch').length }}
            </div>
          </div>
          <div class="rounded-full p-3 bg-green-100 text-green-600">
            <UIcon
              name="i-heroicons-squares-2x2"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>

      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4 border-yellow-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Conexiones</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ links.length }}
            </div>
          </div>
          <div class="rounded-full p-3 bg-yellow-100 text-yellow-600">
            <UIcon
              name="i-heroicons-link"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Network Controls -->
    <UCard class="mb-8 p-4">
      <div class="flex flex-wrap gap-3">
        <UButton
          color="blue"
          variant="solid"
          @click="addNode('router')"
          icon="i-heroicons-server"
          class="shadow-sm"
        >
          Agregar Router
        </UButton>
        <UButton
          color="green"
          variant="solid"
          @click="addNode('switch')"
          icon="i-heroicons-squares-2x2"
          class="shadow-sm"
        >
          Agregar Switch
        </UButton>
        <UButton
          color="red"
          variant="soft"
          @click="clearNetwork"
          icon="i-heroicons-trash"
          class="ml-auto"
        >
          Limpiar Red
        </UButton>
      </div>
    </UCard>

    <!-- Network Graph and Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <UCard class="overflow-hidden">
          <template #header>
            <div class="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
              <div class="flex items-center gap-2">
                <div class="rounded-full p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                  <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5" />
                </div>
                <span class="text-lg font-medium">Visualización de Red</span>
              </div>
              <UBadge color="primary" size="sm" class="ml-2">
                {{ nodes.length }} dispositivos
              </UBadge>
            </div>
          </template>
          <div class="p-0 h-[600px] bg-gray-50 dark:bg-gray-900 rounded-b-lg">
            <NetworkGraph
              :nodes="nodes"
              :links="links"
              :selected-node-id="selectedNodeId"
              @node-added="handleNodeAdded"
              @node-removed="handleNodeRemoved"
              @link-created="handleLinkCreated"
              @node-selected="handleNodeSelected"
            />
          </div>
        </UCard>
      </div>
      
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="p-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-800">
              <UIcon name="i-heroicons-link" class="w-5 h-5 text-primary-500" />
              <span class="text-lg font-medium">Nueva Conexión</span>
            </div>
          </template>
          <div class="p-4">
            <ConnectionForm
              :nodes="nodes"
              @connection-created="handleLinkCreated"
            />
          </div>
        </UCard>
        
        <UCard>
          <template #header>
            <div class="p-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-800">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-primary-500" />
              <span class="text-lg font-medium">Detalles del Dispositivo</span>
            </div>
          </template>
          <div class="p-4">
            <NodeDetails
              :nodes="nodes"
              :links="links"
              :selected-node-id="selectedNodeId"
              @node-updated="handleNodeUpdated"
              @node-deleted="handleNodeRemoved"
              @link-deleted="handleLinkRemoved"
            />
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Node, Link } from '~/types/network';

// Define middleware
definePageMeta({
  middleware: ['auth']
});

// Get translations
const { t } = useTranslation();

// Network state
const nodes = ref<Node[]>([]);
const links = ref<Link[]>([]);
const selectedNodeId = ref<string | null>(null);

// Generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Add a new node
const addNode = (type: 'router' | 'switch') => {
  const nodeCount = nodes.value.filter(n => n.type === type).length + 1;
  const node: Node = {
    id: generateId(),
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeCount}`
  };
  
  nodes.value.push(node);
  saveNetworkToLocalStorage();
};

// Handle node added from the graph
const handleNodeAdded = (node: Node) => {
  nodes.value.push(node);
  saveNetworkToLocalStorage();
};

// Handle node removed
const handleNodeRemoved = (nodeId: string) => {
  // Remove the node
  nodes.value = nodes.value.filter(node => node.id !== nodeId);
  
  // Remove any links connected to this node
  links.value = links.value.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return sourceId !== nodeId && targetId !== nodeId;
  });
  
  // Clear selection if the selected node was removed
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = null;
  }
  
  saveNetworkToLocalStorage();
};

// Handle node updated
const handleNodeUpdated = (updatedNode: Node) => {
  const index = nodes.value.findIndex(node => node.id === updatedNode.id);
  if (index !== -1) {
    nodes.value[index] = updatedNode;
    saveNetworkToLocalStorage();
  }
};

// Handle link created
const handleLinkCreated = (link: Link) => {
  // Check if this link already exists
  const linkExists = links.value.some(l => {
    const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
    const targetId = typeof l.target === 'string' ? l.target : l.target.id;
    const newSourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const newTargetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    return (sourceId === newSourceId && targetId === newTargetId) ||
           (sourceId === newTargetId && targetId === newSourceId);
  });
  
  if (!linkExists) {
    links.value.push(link);
    saveNetworkToLocalStorage();
  }
};

// Handle link removed
const handleLinkRemoved = (linkId: string) => {
  links.value = links.value.filter(link => link.id !== linkId);
  saveNetworkToLocalStorage();
};

// Handle node selected
const handleNodeSelected = (nodeId: string) => {
  selectedNodeId.value = nodeId || null;
};

// Clear the network
const clearNetwork = () => {
  // Show confirmation dialog
  if (window.confirm('¿Está seguro de que desea eliminar todos los nodos y conexiones?')) {
    nodes.value = [];
    links.value = [];
    selectedNodeId.value = null;
    saveNetworkToLocalStorage();
  }
};

// Save network to localStorage
const saveNetworkToLocalStorage = () => {
  if (process.client) {
    localStorage.setItem('network_nodes', JSON.stringify(nodes.value));
    localStorage.setItem('network_links', JSON.stringify(links.value));
  }
};

// Load network from localStorage
const loadNetworkFromLocalStorage = () => {
  if (process.client) {
    try {
      const storedNodes = localStorage.getItem('network_nodes');
      const storedLinks = localStorage.getItem('network_links');
      
      if (storedNodes) {
        nodes.value = JSON.parse(storedNodes);
      }
      
      if (storedLinks) {
        links.value = JSON.parse(storedLinks);
      }
    } catch (error) {
      console.error('Error loading network from localStorage:', error);
    }
  }
};

// Initialize on mount
onMounted(() => {
  loadNetworkFromLocalStorage();
  
  // If there are no nodes, create some default ones
  if (nodes.value.length === 0) {
    // Add some default nodes
    const router1: Node = { id: 'r1', type: 'router', name: 'Router 1' };
    const router2: Node = { id: 'r2', type: 'router', name: 'Router 2' };
    const switch1: Node = { id: 's1', type: 'switch', name: 'Switch 1' };
    const switch2: Node = { id: 's2', type: 'switch', name: 'Switch 2' };
    
    nodes.value = [router1, router2, switch1, switch2];
    
    // Add some default links
    links.value = [
      { id: 'l1', source: 'r1', target: 's1' },
      { id: 'l2', source: 'r2', target: 's1' },
      { id: 'l3', source: 's1', target: 's2' }
    ];
    
    saveNetworkToLocalStorage();
  }
});
</script>
