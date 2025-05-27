<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Network Graph Test</h1>
        <p class="text-gray-500 mt-1">Testing visualization with dummy data</p>
      </div>
      <UButton
        icon="i-heroicons-arrow-path"
        color="primary"
        variant="soft"
        @click="regenerateData"
      >
        Regenerate Data
      </UButton>
    </div>

    <!-- Network Graph -->
    <div class="mb-8">
      <UCard class="overflow-hidden">
        <template #header>
          <div
            class="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800"
          >
            <div class="flex items-center gap-2">
              <div
                class="rounded-full p-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
              >
                <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5" />
              </div>
              <span class="text-lg font-medium">Network Visualization</span>
            </div>
            <UBadge color="primary" size="sm" class="ml-2">
              {{ nodes.length }} devices
            </UBadge>
          </div>
        </template>
        <div class="p-0 h-[600px] bg-gray-50 dark:bg-gray-900 rounded-b-lg">
          <NetworkGraph
            :nodes="nodes"
            :links="links"
            :selected-node-id="selectedNodeId"
            @node-selected="selectedNodeId = $event"
          />
        </div>
      </UCard>
    </div>

    <!-- Bandwidth Monitor -->
    <div class="mb-8">
      <UCard>
        <template #header>
          <div class="p-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-800">
            <UIcon name="i-heroicons-signal" class="w-5 h-5 text-primary-500" />
            <span class="text-lg font-medium">Bandwidth Monitor</span>
          </div>
        </template>
        <div class="p-4">
          <div v-if="highBandwidthLinks.length > 0" class="space-y-2">
            <h3 class="font-medium text-red-500">High Bandwidth Usage</h3>
            <ul class="space-y-2">
              <li
                v-for="link in highBandwidthLinks"
                :key="link.id"
                class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div class="flex justify-between items-center">
                  <span>
                    Link {{ link.id }}: {{ getNodeName(link.source) }} →
                    {{ getNodeName(link.target) }}
                  </span>
                  <UBadge color="red">
                    {{
                      (
                        (link.currentBandwidth / link.maxBandwidth) *
                        100
                      ).toFixed(1)
                    }}%
                  </UBadge>
                </div>
                <div class="mt-1 text-sm text-gray-500">
                  {{ link.currentBandwidth }} / {{ link.maxBandwidth }} Mbps
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            No high bandwidth links detected
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { Node, Link } from "~/types/network";
import { NetworkGraph } from "~/types/network";

// Network state
const nodes = ref<Node[]>([]);
const links = ref<Link[]>([]);
const selectedNodeId = ref<string | null>(null);
const highBandwidthLinks = ref<Link[]>([]);

// Generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Generate random dummy data
const generateDummyData = () => {
  const newNodes: Node[] = [];
  const newLinks: Link[] = [];

  // Generate random nodes
  const nodeCount = Math.floor(Math.random() * 5) + 5; // 5-10 nodes

  // Create routers
  for (let i = 0; i < Math.ceil(nodeCount * 0.3); i++) {
    newNodes.push({
      id: `router-${i}`,
      type: "router",
      name: `Router ${i + 1}`,
      Ports: [
        {
          id: `port-r${i}-1`,
          name: "GigabitEthernet0/0",
          status: "active",
          deviceId: `router-${i}`,
        },
        {
          id: `port-r${i}-2`,
          name: "GigabitEthernet0/1",
          status: "active",
          deviceId: `router-${i}`,
        },
      ],
    });
  }

  // Create switches
  for (let i = 0; i < Math.ceil(nodeCount * 0.7); i++) {
    newNodes.push({
      id: `switch-${i}`,
      type: "switch",
      name: `Switch ${i + 1}`,
      Ports: [
        {
          id: `port-s${i}-1`,
          name: "GigabitEthernet1/0/1",
          status: "active",
          deviceId: `switch-${i}`,
        },
        {
          id: `port-s${i}-2`,
          name: "GigabitEthernet1/0/2",
          status: "active",
          deviceId: `switch-${i}`,
        },
        {
          id: `port-s${i}-3`,
          name: "GigabitEthernet1/0/3",
          status: "active",
          deviceId: `switch-${i}`,
        },
      ],
    });
  }

  // Create ISP
  newNodes.push({
    id: "isp-1",
    type: "isp",
    name: "Internet Service Provider",
    Ports: [
      { id: "port-isp-1", name: "WAN", status: "active", deviceId: "isp-1" },
    ],
  });

  // Generate random links
  // Connect ISP to a router
  newLinks.push({
    id: `link-isp-router`,
    type: "cable",
    source: "port-isp-1",
    target: `port-r0-1`,
    maxBandwidth: 1000,
    currentBandwidth: Math.floor(Math.random() * 800),
  });

  // Connect routers to switches
  const routerNodes = newNodes.filter((n) => n.type === "router");
  const switchNodes = newNodes.filter((n) => n.type === "switch");

  routerNodes.forEach((router) => {
    // Connect each router to 1-2 switches
    const connectCount = Math.min(
      Math.floor(Math.random() * 2) + 1,
      switchNodes.length
    );

    for (let i = 0; i < connectCount; i++) {
      const switchNode = switchNodes[i % switchNodes.length];
      const routerPort = router.Ports[1]; // Use second port
      const switchPort = switchNode.Ports[0]; // Use first port

      newLinks.push({
        id: `link-${router.id}-${switchNode.id}`,
        type: "cable",
        source: routerPort.id,
        target: switchPort.id,
        maxBandwidth: 1000,
        currentBandwidth: Math.floor(Math.random() * 800),
      });
    }
  });

  // Connect switches to each other
  for (let i = 0; i < switchNodes.length - 1; i++) {
    const sourceSwitch = switchNodes[i];
    const targetSwitch = switchNodes[i + 1];

    newLinks.push({
      id: `link-${sourceSwitch.id}-${targetSwitch.id}`,
      type: "cable",
      source: sourceSwitch.Ports[1].id,
      target: targetSwitch.Ports[1].id,
      maxBandwidth: 1000,
      currentBandwidth: Math.floor(Math.random() * 800),
    });
  }

  // Create a ring topology by connecting the last switch to the first
  if (switchNodes.length > 2) {
    const firstSwitch = switchNodes[0];
    const lastSwitch = switchNodes[switchNodes.length - 1];

    newLinks.push({
      id: `link-${lastSwitch.id}-${firstSwitch.id}`,
      type: "cable",
      source: lastSwitch.Ports[2].id,
      target: firstSwitch.Ports[2].id,
      maxBandwidth: 1000,
      currentBandwidth: Math.floor(Math.random() * 800),
    });
  }

  // Set some links to high bandwidth usage for testing
  const highBandwidthLinkCount = Math.floor(newLinks.length * 0.3); // 30% of links
  for (let i = 0; i < highBandwidthLinkCount; i++) {
    const randomLinkIndex = Math.floor(Math.random() * newLinks.length);
    newLinks[randomLinkIndex].currentBandwidth = Math.floor(
      newLinks[randomLinkIndex].maxBandwidth * 0.85 + Math.random() * 200
    );
  }

  nodes.value = newNodes;
  links.value = newLinks;

  // Update high bandwidth links
  updateHighBandwidthLinks();
};

// Get node name by port ID
const getNodeName = (portId: string | any): string => {
  if (typeof portId !== "string") {
    return "Unknown";
  }

  // Find the port
  for (const node of nodes.value) {
    const port = node.Ports.find((p) => p.id === portId);
    if (port) {
      return node.name;
    }
  }

  return "Unknown";
};

// Update high bandwidth links
const updateHighBandwidthLinks = () => {
  const graph = new NetworkGraph();

  // Add nodes and links to the graph
  nodes.value.forEach((node) => graph.addNode(node));
  links.value.forEach((link) => graph.addLink(link));

  // Get links with high bandwidth usage (>80%)
  highBandwidthLinks.value = graph.getLinksByBandwidthUsage(80);
};

// Regenerate data
const regenerateData = () => {
  generateDummyData();

  // Save to localStorage for other components
  localStorage.setItem("network_nodes", JSON.stringify(nodes.value));
  localStorage.setItem("network_links", JSON.stringify(links.value));
};

// Initialize on mount
onMounted(() => {
  generateDummyData();

  // Save to localStorage for other components
  localStorage.setItem("network_nodes", JSON.stringify(nodes.value));
  localStorage.setItem("network_links", JSON.stringify(links.value));
});
</script>
