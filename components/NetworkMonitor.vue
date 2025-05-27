<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { NetworkGraph } from "~/types/network";
import {
  updateNetworkBandwidth,
  startBandwidthMonitoring,
} from "~/services/networkService";

const networkGraph = ref(new NetworkGraph());
const highBandwidthLinks = ref([]);
const isMonitoring = ref(false);
let stopMonitoring: (() => void) | null = null;

// Load initial network data
const loadNetworkData = async () => {
  // Assuming you have your network structure stored somewhere
  const storedNodes = localStorage.getItem("network_nodes");
  const storedLinks = localStorage.getItem("network_links");

  if (storedNodes && storedLinks) {
    const data = {
      nodes: JSON.parse(storedNodes),
      links: JSON.parse(storedLinks),
    };
    networkGraph.value = NetworkGraph.fromJSON(data);

    // Get initial bandwidth data
    await updateNetworkBandwidth(networkGraph.value);
  }
};

// Start monitoring bandwidth
const startMonitoring = () => {
  if (!isMonitoring.value) {
    stopMonitoring = startBandwidthMonitoring(
      networkGraph.value,
      (updatedGraph) => {
        networkGraph.value = updatedGraph;
        // Update high bandwidth links (e.g., >80% usage)
        highBandwidthLinks.value =
          networkGraph.value.getLinksByBandwidthUsage(80);
      }
    );
    isMonitoring.value = true;
  }
};

// Stop monitoring
const stopMonitoringBandwidth = () => {
  if (stopMonitoring) {
    stopMonitoring();
    isMonitoring.value = false;
    stopMonitoring = null;
  }
};

onMounted(async () => {
  await loadNetworkData();
  startMonitoring();
});

onBeforeUnmount(() => {
  stopMonitoringBandwidth();
});
</script>

<template>
  <div>
    <h2>Network Bandwidth Monitor</h2>

    <!-- High bandwidth alerts -->
    <div v-if="highBandwidthLinks.length > 0" class="alerts">
      <h3>High Bandwidth Usage</h3>
      <ul>
        <li v-for="link in highBandwidthLinks" :key="link.id">
          Link {{ link.id }}:
          {{ ((link.currentBandwidth / link.maxBandwidth) * 100).toFixed(1) }}%
          ({{ link.currentBandwidth }} / {{ link.maxBandwidth }} Mbps)
        </li>
      </ul>
    </div>

    <!-- Monitoring controls -->
    <div class="controls">
      <button
        @click="isMonitoring ? stopMonitoringBandwidth() : startMonitoring()"
      >
        {{ isMonitoring ? "Stop Monitoring" : "Start Monitoring" }}
      </button>
    </div>
  </div>
</template>
