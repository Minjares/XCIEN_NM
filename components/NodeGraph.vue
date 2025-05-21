<template>
  <UCard class="overflow-hidden hover:shadow-lg transition-shadow duration-200">
    <template #header>
      <div class="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div class="flex items-center gap-2">
          <div class="rounded-full p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
            <UIcon :name="nodeType === 'router' ? 'i-heroicons-chart-bar' : 'i-heroicons-chart-pie'" class="w-4 h-4" />
          </div>
          <span class="text-lg font-medium">{{ title }}</span>
        </div>
      </div>
    </template>
    <div class="p-4 h-[250px]">
      <canvas ref="chartRef"></canvas>
    </div>
  </UCard>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';

// Get translations
const { t } = useTranslation();

// Define props
const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  nodeType: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Node Performance'
  }
});

// Chart reference
const chartRef = ref(null);
let chart = null;

// Generate random data for the chart
const generateRandomData = (min, max, count) => {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

// Initialize the chart
const initChart = () => {
  if (!chartRef.value) return;

  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy();
  }

  // Generate time labels (last 24 hours)
  const timeLabels = [];
  for (let i = 24; i >= 0; i--) {
    const hour = i === 0 ? 'Now' : `${i}h ago`;
    timeLabels.push(hour);
  }

  // Generate datasets based on node type
  let datasets = [];

  if (props.nodeType === 'router') {
    // For routers, show CPU usage, memory usage, and network throughput
    datasets = [
      {
        label: t('cpuUsage'),
        data: generateRandomData(20, 80, 25),
        borderColor: '#00205b', // XCIEN dark blue
        backgroundColor: 'rgba(0, 32, 91, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: t('memoryUsage'),
        data: generateRandomData(30, 90, 25),
        borderColor: '#4caf50', // XCIEN green
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: t('networkThroughput'),
        data: generateRandomData(100, 800, 25),
        borderColor: '#2ecc71', // Lighter green
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ];
  } else {
    // For switches, show port utilization, packet loss, and memory usage
    datasets = [
      {
        label: t('portUtilization'),
        data: generateRandomData(30, 90, 25),
        borderColor: '#4caf50', // XCIEN green
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: t('memoryUsage'),
        data: generateRandomData(20, 70, 25),
        borderColor: '#00205b', // XCIEN dark blue
        backgroundColor: 'rgba(0, 32, 91, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: t('packetLoss'),
        data: generateRandomData(0, 5, 25),
        borderColor: '#e74c3c', // Red for errors
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ];
  }

  // Create the chart
  chart = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: `${t('usage')} (%)`
          },
          max: 100
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: props.nodeType === 'router' ? `${t('throughput')} (Mbps)` : `${t('packetLoss')} (%)`
          },
          max: props.nodeType === 'router' ? 1000 : 10
        }
      }
    }
  });
};

// Watch for changes in nodeId or nodeType
watch(() => [props.nodeId, props.nodeType], () => {
  initChart();
}, { immediate: false });

// Initialize chart on mount
onMounted(() => {
  initChart();
});

// Clean up chart on unmount
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});
</script>
