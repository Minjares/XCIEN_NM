<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Panel de Control</h1>
        <p class="text-gray-500 mt-1">{{ new Date().toLocaleDateString() }}</p>
      </div>
      <UButton
        icon="i-heroicons-arrow-path"
        color="primary"
        variant="soft"
        @click="refreshData"
      >
        Actualizar 
      </UButton>
    </div>

    <!-- System Status Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4"
        :class="systemHealth === 'normal' ? 'border-green-500' : systemHealth === 'warning' ? 'border-yellow-500' : 'border-red-500'"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Salud del Sistema</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ systemHealthStatus }}
              <UBadge
                :color="systemHealth === 'normal' ? 'green' : systemHealth === 'warning' ? 'yellow' : 'red'"
                variant="subtle"
                size="sm"
              >
                <UIcon
                  :name="systemHealth === 'normal' ? 'i-heroicons-check-circle' : systemHealth === 'warning' ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-x-circle'"
                  class="mr-1"
                />
                {{ systemHealth === 'normal' ? 'normal' : systemHealth === 'warning' ? 'advertencia' : 'crítico' }}
              </UBadge>
            </div>
          </div>
          <div class="rounded-full p-3" :class="systemHealth === 'normal' ? 'bg-green-100 text-green-600' : systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'">
            <UIcon
              name="i-heroicons-server"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>

      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4"
        :class="networkHealth === 'normal' ? 'border-green-500' : networkHealth === 'warning' ? 'border-yellow-500' : 'border-red-500'"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Salud de la Red</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ networkHealthStatus }}
              <UBadge
                :color="networkHealth === 'normal' ? 'green' : networkHealth === 'warning' ? 'yellow' : 'red'"
                variant="subtle"
                size="sm"
              >
                <UIcon
                  :name="networkHealth === 'normal' ? 'i-heroicons-check-circle' : networkHealth === 'warning' ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-x-circle'"
                  class="mr-1"
                />
                {{ networkHealth === 'normal' ? 'normal' : networkHealth === 'warning' ? 'advertencia' : 'crítico' }}
              </UBadge>
            </div>
          </div>
          <div class="rounded-full p-3" :class="networkHealth === 'normal' ? 'bg-green-100 text-green-600' : networkHealth === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'">
            <UIcon
              name="i-heroicons-globe-alt"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>

      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4"
        :class="securityStatus === 'normal' ? 'border-green-500' : securityStatus === 'warning' ? 'border-yellow-500' : 'border-red-500'"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Estado de Seguridad</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ securityStatusText }}
              <UBadge
                :color="securityStatus === 'normal' ? 'green' : securityStatus === 'warning' ? 'yellow' : 'red'"
                variant="subtle"
                size="sm"
              >
                <UIcon
                  :name="securityStatus === 'normal' ? 'i-heroicons-shield-check' : securityStatus === 'warning' ? 'i-heroicons-shield-exclamation' : 'i-heroicons-shield-x'"
                  class="mr-1"
                />
                {{ securityStatus === 'normal' ? 'normal' : securityStatus === 'warning' ? 'advertencia' : 'crítico' }}
              </UBadge>
            </div>
          </div>
          <div class="rounded-full p-3" :class="securityStatus === 'normal' ? 'bg-green-100 text-green-600' : securityStatus === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'">
            <UIcon
              name="i-heroicons-lock-closed"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>

      <UCard
        :ui="{ body: { base: 'p-5' } }"
        class="hover:shadow-lg transition-shadow duration-200 border-t-4"
        :class="alertCount > 5 ? 'border-red-500' : alertCount > 0 ? 'border-yellow-500' : 'border-green-500'"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-2">Alertas</div>
            <div class="text-xl font-semibold flex items-center gap-2">
              {{ alertCount }}
              <UBadge
                :color="alertCount > 5 ? 'red' : alertCount > 0 ? 'yellow' : 'green'"
                variant="subtle"
                size="sm"
              >
                <UIcon
                  :name="alertCount > 5 ? 'i-heroicons-bell-alert' : alertCount > 0 ? 'i-heroicons-bell' : 'i-heroicons-bell-slash'"
                  class="mr-1"
                />
                {{ alertCount > 5 ? 'Alto' : alertCount > 0 ? 'Moderado' : 'Ninguno' }}
              </UBadge>
            </div>
          </div>
          <div class="rounded-full p-3" :class="alertCount > 5 ? 'bg-red-100 text-red-600' : alertCount > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'">
            <UIcon
              name="i-heroicons-bell-alert"
              class="w-8 h-8"
            />
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Network Overview Card -->
      <UCard>
        <template #header>
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="rounded-full p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
              </div>
              <span class="text-lg font-medium">Resumen de Red</span>
            </div>
          </div>
        </template>
        <div class="p-5 h-[300px]">
          <canvas ref="networkOverviewChart"></canvas>
        </div>
      </UCard>

      <!-- Traffic Analysis Card -->
      <UCard
        :ui="{ base: 'overflow-hidden', body: { padding: 'p-0' } }"
        class="hover:shadow-lg transition-shadow duration-200"
      >
        <template #header>
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-primary-500" />
              <span class="text-lg font-medium">Análisis de Tráfico</span>
            </div>
          </div>
          <UDivider />
        </template>
        <div class="p-5 h-[300px]">
          <canvas ref="trafficChart"></canvas>
        </div>
      </UCard>

      <!-- Device Status Card -->
      <UCard
        :ui="{ base: 'overflow-hidden', body: { padding: 'p-0' } }"
        class="hover:shadow-lg transition-shadow duration-200"
      >
        <template #header>
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-primary-500" />
              <span class="text-lg font-medium">Estado de Dispositivos</span>
            </div>
          </div>
        </template>
        <UDivider />
        <div class="p-5 h-[300px]">
          <canvas ref="deviceStatusChart"></canvas>
        </div>
      </UCard>

      <!-- Performance Metrics Card -->
      <UCard
        :ui="{ base: 'overflow-hidden', body: { padding: 'p-0' } }"
        class="hover:shadow-lg transition-shadow duration-200"
      >
        <template #header>
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-primary-500" />
              <span class="text-lg font-medium">Métricas de Rendimiento</span>
            </div>
          </div>
        </template>
        <UDivider />
        <div class="p-5 h-[300px]">
          <canvas ref="performanceChart"></canvas>
        </div>
      </UCard>

      <!-- Alerts Card -->
      <UCard
        :ui="{ base: 'overflow-hidden', body: { padding: 'p-0' } }"
        class="hover:shadow-lg transition-shadow duration-200"
      >
        <template #header>
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-bell-alert" class="w-5 h-5 text-primary-500" />
              <span class="text-lg font-medium">Alertas</span>
            </div>
            <UBadge :color="criticalAlerts.length > 0 ? 'red' : 'gray'" size="sm" class="ml-2">
              {{ criticalAlerts.length + warningAlerts.length }}
            </UBadge>
          </div>
        </template>
        <UDivider />
        <div class="max-h-[400px] overflow-y-auto">
          <div v-if="criticalAlerts.length > 0" class="mb-4 p-4">
            <div class="text-sm font-semibold text-red-500 mb-3 pb-2 border-b flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
              Alertas Críticas
            </div>
            <UCard
              v-for="(alert, index) in criticalAlerts"
              :key="'critical-'+index"
              class="mb-3 bg-red-50 dark:bg-red-950 border-l-4 border-red-500"
              :ui="{ body: { padding: 'p-3' } }"
            >
              <div class="flex">
                <div class="flex-1">
                  <div class="font-medium flex items-center gap-2">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500" />
                    {{ alert.title }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ alert.message }}</div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="text-xs text-gray-500">{{ alert.time }}</div>
                    <UButton size="xs" color="red" variant="soft">Resolver</UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <div v-if="warningAlerts.length > 0" class="p-4">
            <div class="text-sm font-semibold text-yellow-500 mb-3 pb-2 border-b flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
              Alertas de Advertencia
            </div>
            <UCard
              v-for="(alert, index) in warningAlerts"
              :key="'warning-'+index"
              class="mb-3 bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500"
              :ui="{ body: { padding: 'p-3' } }"
            >
              <div class="flex">
                <div class="flex-1">
                  <div class="font-medium flex items-center gap-2">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-yellow-500" />
                    {{ alert.title }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ alert.message }}</div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="text-xs text-gray-500">{{ alert.time }}</div>
                    <UButton size="xs" color="yellow" variant="soft">Resolver</UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <div v-if="criticalAlerts.length === 0 && warningAlerts.length === 0" class="py-12 text-center text-gray-500">
            <UIcon name="i-heroicons-check-circle" class="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>No hay alertas</p>
            <p class="text-sm text-gray-400 mt-1">Todos los sistemas funcionan normalmente</p>
          </div>
        </div>
      </UCard>

      <!-- Recent Events Card -->
      <UCard
        :ui="{ base: 'overflow-hidden', body: { padding: 'p-0' } }"
        class="hover:shadow-lg transition-shadow duration-200"
      >
        <template #header>
          <div class="p-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-primary-500" />
              <span class="text-lg font-medium">Eventos Recientes</span>
            </div>
            <UBadge color="gray" size="sm" class="ml-2">
              {{ recentEvents.length }}
            </UBadge>
          </div>
        </template>
        <UDivider />
        <div class="max-h-[400px] overflow-y-auto p-4">
          <div v-if="recentEvents.length > 0" class="space-y-4">
            <div
              v-for="(event, index) in recentEvents"
              :key="index"
              class="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div :class="`rounded-full p-2 ${event.type === 'critical' ? 'bg-red-100 text-red-600' : event.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : event.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`">
                <UIcon
                  :name="getEventIcon(event)"
                  class="w-4 h-4"
                />
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ event.title }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ event.description }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ event.time }}</div>
              </div>
            </div>
          </div>
          <div v-else class="py-12 text-center text-gray-500">
            <UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay eventos</p>
            <p class="text-sm text-gray-400 mt-1">Vuelve a revisar más tarde</p>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';

// Define middleware
definePageMeta({
  middleware: ['auth']
});

// All text is now in Spanish directly

// Chart references
const networkOverviewChart = ref(null);
const trafficChart = ref(null);
const deviceStatusChart = ref(null);
const performanceChart = ref(null);

const systemHealth = ref('normal'); // normal, warning, critical
const networkHealth = ref('normal');
const securityStatus = ref('normal');



// Refresh data function
const refreshData = () => {
  // This would typically fetch new data from an API
  // For now, we'll just simulate a refresh with a timeout
  const loading = useState('loading', () => true);
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

// Computed status text
const systemHealthStatus = computed(() => {
  return systemHealth.value === 'normal' ? 'Normal' :
         systemHealth.value === 'warning' ? 'Advertencia' : 'Crítico';
});

const networkHealthStatus = computed(() => {
  return networkHealth.value === 'normal' ? 'Normal' :
         networkHealth.value === 'warning' ? 'Advertencia' : 'Crítico';
});

const securityStatusText = computed(() => {
  return securityStatus.value === 'normal' ? 'Seguro' :
         securityStatus.value === 'warning' ? 'Advertencia' : 'Vulnerabilidad';
});

// Event helper functions

const getEventIcon = (event) => {
  if (event.type === 'critical') return 'i-heroicons-exclamation-circle';
  if (event.type === 'warning') return 'i-heroicons-exclamation-triangle';
  if (event.type === 'success') return 'i-heroicons-check-circle';
  return 'i-heroicons-information-circle'; // default
};


// Alerts data
const criticalAlerts = ref([
  {
    title: 'Error de conexión en Router 2',
    message: 'Pérdida de conectividad detectada en la interfaz WAN',
    time: '10:45 AM'
  }
]);

const warningAlerts = ref([
  {
    title: 'Uso elevado de CPU en Switch 1',
    message: 'El uso de CPU ha superado el 80% durante los últimos 15 minutos',
    time: '09:30 AM'
  },
  {
    title: 'Actualización de firmware disponible',
    message: 'Nueva versión de firmware disponible para 3 dispositivos',
    time: '08:15 AM'
  }
]);

// Computed alert count
const alertCount = computed(() => {
  return criticalAlerts.value.length + warningAlerts.value.length;
});

// Recent events data
const recentEvents = ref([
  {
    time: '10:45 AM',
    title: 'Router 2 desconectado',
    description: 'El Router 2 ha perdido conectividad con la red',
    type: 'critical'
  },
  {
    time: '09:30 AM',
    title: 'Alerta de rendimiento',
    description: 'Switch 1 reporta uso elevado de CPU',
    type: 'warning'
  },
  {
    time: '08:15 AM',
    title: 'Actualización disponible',
    description: 'Nueva versión de firmware disponible para múltiples dispositivos',
    type: 'warning'
  },
  {
    time: '07:50 AM',
    title: 'Conexión establecida',
    description: 'Nueva conexión entre Router 1 y Switch 1',
    type: 'success'
  },
  {
    time: 'Ayer, 18:30',
    title: 'Mantenimiento programado',
    description: 'Mantenimiento programado para mañana a las 22:00',
    type: 'info'
  }
]);

// Initialize charts
onMounted(() => {
  // Network Overview Chart (Pie Chart)
  new Chart(networkOverviewChart.value, {
    type: 'pie',
    data: {
      labels: ['Routers', 'Switches', 'Endpoints', 'Servidores'],
      datasets: [{
        data: [12, 19, 32, 8],
        backgroundColor: [
          'rgba(0, 32, 91, 0.8)',  // XCIEN dark blue
          'rgba(76, 175, 80, 0.8)', // XCIEN green
          'rgba(46, 204, 113, 0.7)', // Lighter green
          'rgba(0, 32, 91, 0.6)'   // Lighter blue
        ],
        borderColor: [
          'rgba(0, 32, 91, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(0, 32, 91, 0.8)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Distribución de Dispositivos de Red'
        }
      }
    }
  });

  // Traffic Analysis Chart (Line Chart)
  new Chart(trafficChart.value, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      datasets: [{
        label: 'Tráfico Entrante (Gbps)',
        data: [2.3, 1.8, 5.4, 7.8, 8.2, 6.5, 3.1],
        borderColor: 'rgba(0, 32, 91, 1)',
        backgroundColor: 'rgba(0, 32, 91, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Tráfico Saliente (Gbps)',
        data: [1.9, 1.2, 4.8, 6.5, 7.1, 5.8, 2.7],
        borderColor: 'rgba(76, 175, 80, 1)',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Gbps'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Hora'
          }
        }
      }
    }
  });

  // Device Status Chart (Doughnut Chart)
  new Chart(deviceStatusChart.value, {
    type: 'doughnut',
    data: {
      labels: ['En línea', 'Desconectado', 'Mantenimiento', 'Advertencia'],
      datasets: [{
        data: [42, 3, 5, 8],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)', // Green - Online
          'rgba(231, 76, 60, 0.8)',  // Red - Offline
          'rgba(241, 196, 15, 0.8)', // Yellow - Maintenance
          'rgba(230, 126, 34, 0.8)'  // Orange - Warning
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(230, 126, 34, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Estado de Dispositivos'
        }
      }
    }
  });

  // Performance Metrics Chart (Bar Chart)
  new Chart(performanceChart.value, {
    type: 'bar',
    data: {
      labels: ['Router 1', 'Router 2', 'Switch 1', 'Switch 2', 'Switch 3'],
      datasets: [{
        label: 'Uso de CPU (%)',
        data: [65, 42, 28, 35, 22],
        backgroundColor: 'rgba(0, 32, 91, 0.7)'
      }, {
        label: 'Uso de Memoria (%)',
        data: [78, 55, 40, 48, 35],
        backgroundColor: 'rgba(76, 175, 80, 0.7)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Porcentaje (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Dispositivos'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Uso de Recursos por Dispositivo'
        }
      }
    }
  });
});
</script>
