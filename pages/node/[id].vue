<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <NuxtLink to="/" class="text-blue-500 hover:text-blue-700 flex items-center">
        <UIcon name="i-heroicons-arrow-left" class="mr-1" />
        Volver a la Red
      </NuxtLink>
      <h1 class="text-2xl font-bold mt-2">{{ nodeData?.name || 'Información del Nodo' }}</h1>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-gray-500" />
      <p class="mt-4 text-gray-500">Cargando...</p>
    </div>

    <div v-else-if="!nodeData" class="flex flex-col items-center justify-center py-12">
      <p class="text-gray-500 mb-4">Ha ocurrido un error</p>
      <UButton to="/" color="blue">Volver a la Red</UButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- General Info Card -->
      <UCard>
        <template #header>
          <div class="text-lg font-medium">Información General</div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500">Nombre</div>
            <div class="font-medium">{{ nodeData.name }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Dirección IP</div>
            <div class="font-medium">{{ nodeIp }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Dirección MAC</div>
            <div class="font-medium">{{ nodeMac }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Modelo</div>
            <div class="font-medium">{{ nodeModel }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Versión de Firmware</div>
            <div class="font-medium">{{ nodeFirmware }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Última Actualización</div>
            <div class="font-medium">{{ nodeLastUpdated }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Número de Serie</div>
            <div class="font-medium">{{ nodeSerial }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Ubicación</div>
            <div class="font-medium">{{ nodeLocation }}</div>
          </div>
        </div>
      </UCard>

      <!-- Status Card -->
      <UCard>
        <template #header>
          <div class="text-lg font-medium">Estado de Dispositivos</div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <div>
              <div class="text-sm text-gray-500">Estado</div>
              <div class="font-medium text-green-500">En línea</div>
            </div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Tiempo de Actividad</div>
            <div class="font-medium">{{ nodeUptime }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Uso de CPU</div>
            <div class="font-medium" :class="cpuStatus === 'critical' ? 'text-red-500' : cpuStatus === 'warning' ? 'text-yellow-500' : 'text-blue-500'">
              {{ nodeCpuUsage }}%
            </div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Uso de Memoria</div>
            <div class="font-medium" :class="memoryStatus === 'critical' ? 'text-red-500' : memoryStatus === 'warning' ? 'text-yellow-500' : 'text-blue-500'">
              {{ nodeMemoryUsage }}%
            </div>
          </div>
        </div>
      </UCard>

      <!-- Performance Tabs Card -->
      <UCard>
        <template #header>
          <div class="text-lg font-medium">Gráficos de Rendimiento</div>
        </template>

        <UTabs :items="tabs" v-model="activeTab">
          <template #item="{ item }">
            <div v-if="item.id === 'performance'" class="py-4">
              <NodeGraph
                :nodeId="nodeId"
                :nodeType="nodeData.type"
                :title="nodeData.name + ' - Métricas de Rendimiento'"
              />
            </div>

            <div v-if="item.id === 'traffic'" class="py-4">
              <div class="h-[250px]">
                <canvas ref="trafficChart"></canvas>
              </div>
            </div>

            <div v-if="item.id === 'errors'" class="py-4">
              <div class="h-[250px]">
                <canvas ref="errorsChart"></canvas>
              </div>
            </div>
          </template>
        </UTabs>
      </UCard>

      <!-- Connections Card -->
      <UCard>
        <template #header>
          <div class="text-lg font-medium">Detalles de Conexión</div>
        </template>

        <div v-if="nodeConnections.length === 0" class="py-8 text-center text-gray-500">
          Sin conexiones
        </div>

        <div v-else>
          <UList>
            <UListItem v-for="connection in nodeConnections" :key="connection.nodeId" class="py-3">
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                     :class="getNodeType(connection.nodeId) === 'router' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  <UIcon :name="getNodeType(connection.nodeId) === 'router' ? 'i-heroicons-server' : 'i-heroicons-squares-2x2'" />
                </div>
                <div class="flex-1">
                  <div class="font-medium">{{ getNodeName(connection.nodeId) }}</div>
                  <div class="text-xs text-gray-500">{{ getNodeType(connection.nodeId) === 'router' ? 'Router' : getNodeType(connection.nodeId) === 'switch' ? 'Switch' : 'ISP' }}</div>
                </div>
                <UButton
                  to="`/node/${connection.nodeId}`"
                  color="blue"
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-arrow-right"
                  @click="navigateToNode(connection.nodeId)"
                >
                  Ver
                </UButton>
              </div>
            </UListItem>
          </UList>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import Chart from 'chart.js/auto';

// Define middleware
definePageMeta({
  middleware: ['auth']
});

// Get route
const route = useRoute();
// All text is now in Spanish directly

// Node ID from route params
const nodeId = computed(() => route.params.id);

// State
const isLoading = ref(true);
const nodeData = ref(null);
const nodes = ref([]);
const links = ref([]);
const activeTab = ref('performance');

// Charts refs
const trafficChart = ref(null);
const errorsChart = ref(null);
let trafficChartInstance = null;
let errorsChartInstance = null;

// Tabs configuration
const tabs = [
  { id: 'performance', label: 'Métricas de Rendimiento' },
  { id: 'traffic', label: 'Análisis de Tráfico' },
  { id: 'errors', label: 'Pérdida de Paquetes' }
];

// Generate random data for the node
const nodeIp = ref('192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255));
const nodeMac = ref(Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'));
const nodeModel = ref('XCIEN-' + (Math.floor(Math.random() * 9000) + 1000));
const nodeFirmware = ref('v' + Math.floor(Math.random() * 10) + '.' + Math.floor(Math.random() * 10) + '.' + Math.floor(Math.random() * 10));
const nodeLastUpdated = ref(new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'));
const nodeSerial = ref('SN-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
const nodeLocation = ref(['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'][Math.floor(Math.random() * 5)]);
const nodeUptime = ref(`${Math.floor(Math.random() * 100) + 1}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`);
const nodeCpuUsage = ref(Math.floor(Math.random() * 80) + 10);
const nodeMemoryUsage = ref(Math.floor(Math.random() * 70) + 20);

// Computed properties for status indicators
const cpuStatus = computed(() => {
  if (nodeCpuUsage.value > 80) return 'critical';
  if (nodeCpuUsage.value > 60) return 'warning';
  return 'normal';
});

const memoryStatus = computed(() => {
  if (nodeMemoryUsage.value > 80) return 'critical';
  if (nodeMemoryUsage.value > 60) return 'warning';
  return 'normal';
});

// Get node connections
const nodeConnections = computed(() => {
  if (!nodeData.value) return [];

  return links.value
    .filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return sourceId === nodeId.value || targetId === nodeId.value;
    })
    .map(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      const connectedNodeId = sourceId === nodeId.value ? targetId : sourceId;
      return {
        linkId: link.id,
        nodeId: connectedNodeId
      };
    });
});

// Get node name by ID
const getNodeName = (id) => {
  const node = nodes.value.find(n => n.id === id);
  return node ? node.name : 'Unknown';
};

// Get node type by ID
const getNodeType = (id) => {
  const node = nodes.value.find(n => n.id === id);
  return node ? node.type : 'unknown';
};

// Navigate to another node
const navigateToNode = (id) => {
  navigateTo(`/node/${id}`);
};

// Initialize traffic and errors charts
const initCharts = () => {
  // Clean up existing charts
  if (trafficChartInstance) {
    trafficChartInstance.destroy();
  }

  if (errorsChartInstance) {
    errorsChartInstance.destroy();
  }

  // Only initialize if the refs exist and the tab is active
  if (activeTab.value === 'traffic' && trafficChart.value) {
    // Generate time labels (last 24 hours)
    const timeLabels = [];
    for (let i = 24; i >= 0; i--) {
      timeLabels.push(`${i}h`);
    }

    // Generate random data
    const inboundData = Array.from({ length: 25 }, () => Math.floor(Math.random() * 800) + 200);
    const outboundData = Array.from({ length: 25 }, () => Math.floor(Math.random() * 600) + 100);

    trafficChartInstance = new Chart(trafficChart.value, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Tráfico Entrante (Mbps)',
            data: inboundData,
            borderColor: '#00205b',
            backgroundColor: 'rgba(0, 32, 91, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Tráfico Saliente (Mbps)',
            data: outboundData,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Mbps'
            }
          }
        }
      }
    });
  }

  if (activeTab.value === 'errors' && errorsChart.value) {
    // Generate time labels (last 24 hours)
    const timeLabels = [];
    for (let i = 24; i >= 0; i--) {
      timeLabels.push(`${i}h`);
    }

    // Generate random data
    const packetLossData = Array.from({ length: 25 }, () => Math.random() * 2);
    const errorRateData = Array.from({ length: 25 }, () => Math.random() * 1);

    errorsChartInstance = new Chart(errorsChart.value, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Pérdida de Paquetes (%)',
            data: packetLossData,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Tasa de Error (%)',
            data: errorRateData,
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Percentage (%)'
            },
            max: 5
          }
        }
      }
    });
  }
};

// Load node data from localStorage
const loadNodeData = () => {
  isLoading.value = true;

  try {
    if (import.meta.client) {
      // Load nodes and links from localStorage
      const storedNodes = localStorage.getItem('network_nodes');
      const storedLinks = localStorage.getItem('network_links');

      if (storedNodes) {
        nodes.value = JSON.parse(storedNodes);
      }

      if (storedLinks) {
        links.value = JSON.parse(storedLinks);
      }

      // Find the node with the matching ID
      const node = nodes.value.find(n => n.id === nodeId.value);

      if (node) {
        nodeData.value = node;
      } else {
        // Node not found, redirect to network page
        navigateTo('/');
      }
    }
  } catch (error) {
    console.error('Error loading node data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Watch for changes in node ID
watch(() => nodeId.value, () => {
  loadNodeData();
});

// Watch for tab changes to reinitialize charts
watch(() => activeTab.value, () => {
  // Wait for DOM update
  setTimeout(() => {
    initCharts();
  }, 100);
});

// Initialize on mount
onMounted(() => {
  loadNodeData();

  // Initialize charts after a short delay to ensure DOM is ready
  setTimeout(() => {
    initCharts();
  }, 100);
});

// Clean up charts on unmount
onBeforeUnmount(() => {
  if (trafficChartInstance) {
    trafficChartInstance.destroy();
  }

  if (errorsChartInstance) {
    errorsChartInstance.destroy();
  }
});
</script>
