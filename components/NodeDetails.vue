<template>
  <div>
    <div v-if="selectedNode" class="space-y-6">
      <UFormGroup label="Nombre del Dispositivo">
        <UInput
          v-model="nodeName"
          @input="updateNode"
          size="lg"
          :ui="{ base: 'w-full' }"
          icon="i-heroicons-pencil"
        />
      </UFormGroup>
      
      <div class="flex items-center gap-3">
        <UBadge
          :color="selectedNode.type === 'router' ? 'blue' : 'green'"
          size="lg"
          class="capitalize"
          variant="soft"
        >
          <UIcon
            :name="selectedNode.type === 'router' ? 'i-heroicons-server' : 'i-heroicons-squares-2x2'"
            class="w-4 h-4 mr-1"
          />
          {{ selectedNode.type === 'router' ? 'Router' : 'Switch' }}
        </UBadge>
        
        <UBadge
          color="green"
          size="lg"
          variant="soft"
        >
          <UIcon name="i-heroicons-signal" class="w-4 h-4 mr-1" />
          Online
        </UBadge>
      </div>
      
      <UDivider label="Conexiones" />
      
      <div>
        <div v-if="nodeConnections.length === 0" class="text-gray-500 text-sm py-2 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 mb-1 mx-auto" />
          <p>No hay conexiones para este dispositivo</p>
        </div>
        <UList v-else class="divide-y">
          <UListItem v-for="connection in nodeConnections" :key="connection.linkId" class="py-3">
            <template #leading>
              <UIcon
                :name="getNodeType(connection.nodeId) === 'router' ? 'i-heroicons-server' : 'i-heroicons-squares-2x2'"
                class="w-5 h-5"
                :class="getNodeType(connection.nodeId) === 'router' ? 'text-blue-500' : 'text-green-500'"
              />
            </template>
            <div class="flex-1">{{ getNodeName(connection.nodeId) }}</div>
            <template #trailing>
              <UButton
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                size="xs"
                @click="removeConnection(connection.linkId)"
                :ui="{ rounded: 'rounded-full' }"
              />
            </template>
          </UListItem>
        </UList>
      </div>
      
      <!-- Node Statistics -->
      <UDivider label="Estadísticas" />
      
      <div class="grid grid-cols-2 gap-4">
        <UCard class="text-center hover:shadow-md transition-shadow duration-200" :ui="{ body: { padding: 'p-3' } }">
          <UIcon name="i-heroicons-clock" class="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div class="text-xs text-gray-500">Tiempo Activo</div>
          <div class="text-base font-semibold text-blue-500">{{ getRandomUptime() }}</div>
        </UCard>
        <UCard class="text-center hover:shadow-md transition-shadow duration-200" :ui="{ body: { padding: 'p-3' } }">
          <UIcon name="i-heroicons-cpu-chip" class="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div class="text-xs text-gray-500">CPU</div>
          <div class="text-base font-semibold text-blue-500">{{ getRandomStat(10, 80) }}%</div>
        </UCard>
        <UCard class="text-center hover:shadow-md transition-shadow duration-200" :ui="{ body: { padding: 'p-3' } }">
          <UIcon name="i-heroicons-server-stack" class="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div class="text-xs text-gray-500">Memoria</div>
          <div class="text-base font-semibold text-blue-500">{{ getRandomStat(20, 90) }}%</div>
        </UCard>
        <UCard class="text-center hover:shadow-md transition-shadow duration-200" :ui="{ body: { padding: 'p-3' } }">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div class="text-xs text-gray-500">Tráfico</div>
          <div class="text-base font-semibold text-blue-500">{{ getRandomStat(100, 900) }} Mbps</div>
        </UCard>
      </div>
      
      <!-- Node Performance Graph -->
      <NodeGraph
        :nodeId="selectedNode.id"
        :nodeType="selectedNode.type"
        :title="`${selectedNode.name} - Rendimiento`"
      />
      
      <UButton
        block
        color="red"
        @click="deleteNode"
        icon="i-heroicons-trash"
        size="lg"
        :ui="{ rounded: 'rounded-lg' }"
      >
        Eliminar Dispositivo
      </UButton>
    </div>
    
    <div v-else class="py-16 text-center text-gray-500">
      <UIcon name="i-heroicons-computer-desktop" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p class="text-lg">Seleccione un dispositivo para ver sus detalles</p>
      <p class="text-sm text-gray-400 mt-1">Haga clic en un dispositivo en el gráfico de red</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Node, Link } from '~/types/network';

// Get translations
const { t } = useTranslation();

// Define props
const props = defineProps<{
  nodes: Node[];
  links: Link[];
  selectedNodeId: string | null;
}>();

// Define emits
const emit = defineEmits<{
  'node-updated': [node: Node];
  'node-deleted': [nodeId: string];
  'link-deleted': [linkId: string];
}>();

// Local state
const nodeName = ref('');

// Get the selected node
const selectedNode = computed(() => {
  if (!props.selectedNodeId) return null;
  return props.nodes.find(node => node.id === props.selectedNodeId) || null;
});

// Get connections for the selected node
const nodeConnections = computed(() => {
  if (!props.selectedNodeId) return [];

  return props.links
    .filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return sourceId === props.selectedNodeId || targetId === props.selectedNodeId;
    })
    .map(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      const nodeId = sourceId === props.selectedNodeId ? targetId : sourceId;
      return {
        linkId: link.id,
        nodeId
      };
    });
});

// Get node name by ID
const getNodeName = (nodeId: string) => {
  const node = props.nodes.find(n => n.id === nodeId);
  return node ? node.name : 'Unknown Node';
};

// Update node name
const updateNode = () => {
  if (!selectedNode.value) return;

  const updatedNode = {
    ...selectedNode.value,
    name: nodeName.value
  };

  emit('node-updated', updatedNode);
};

// Delete node
const deleteNode = () => {
  if (!props.selectedNodeId) return;
  emit('node-deleted', props.selectedNodeId);
};

// Remove connection
const removeConnection = (linkId: string) => {
  emit('link-deleted', linkId);
};

// Generate random statistics for the node
const getRandomStat = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate random uptime for the node
const getRandomUptime = () => {
  const days = Math.floor(Math.random() * 30) + 1;
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);

  return `${days}d ${hours}h ${minutes}m`;
};

// Watch for changes in selected node
watch(() => props.selectedNodeId, () => {
  if (selectedNode.value) {
    nodeName.value = selectedNode.value.name;
  } else {
    nodeName.value = '';
  }
});

// Initialize name when component is created
if (selectedNode.value) {
  nodeName.value = selectedNode.value.name;
}
</script>
