<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold mb-6">Network Graph Test Suite</h1>

    <div class="grid grid-cols-1 gap-6">
      <!-- Test Case Controls -->
      <UCard>
        <template #header>
          <div class="p-4 bg-gray-50 dark:bg-gray-800">
            <h2 class="text-xl font-medium">Test Cases</h2>
          </div>
        </template>
        <div class="p-4">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="test in testCases"
              :key="test.name"
              @click="runTest(test)"
              color="primary"
              variant="soft"
            >
              {{ test.name }}
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Current Test Description -->
      <UCard v-if="currentTest">
        <div class="p-4">
          <h3 class="text-lg font-medium mb-2">{{ currentTest.name }}</h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ currentTest.description }}
          </p>
        </div>
      </UCard>

      <!-- Network Graph -->
      <UCard class="overflow-hidden">
        <template #header>
          <div class="p-4 bg-gray-50 dark:bg-gray-800">
            <h2 class="text-xl font-medium">Network Visualization</h2>
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

      <!-- Test Results -->
      <UCard>
        <template #header>
          <div class="p-4 bg-gray-50 dark:bg-gray-800">
            <h2 class="text-xl font-medium">Test Results</h2>
          </div>
        </template>
        <div class="p-4">
          <div
            v-if="testResults.length === 0"
            class="text-gray-500 text-center py-4"
          >
            Run a test to see results
          </div>
          <div v-else>
            <div
              v-for="(result, index) in testResults"
              :key="index"
              class="mb-2 p-3 rounded-lg"
              :class="
                result.passed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              "
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="
                    result.passed
                      ? 'i-heroicons-check-circle'
                      : 'i-heroicons-x-circle'
                  "
                  class="w-5 h-5"
                  :class="result.passed ? 'text-green-500' : 'text-red-500'"
                />
                <span>{{ result.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Node, Link } from "~/types/network";
import { NetworkGraph } from "~/types/network";

// Test state
const nodes = ref<Node[]>([]);
const links = ref<Link[]>([]);
const selectedNodeId = ref<string | null>(null);
const testResults = ref<Array<{ passed: boolean; message: string }>>([]);
const currentTest = ref<{ name: string; description: string } | null>(null);

// Test cases
const testCases = [
  {
    name: "Simple Network",
    description:
      "A basic network with 1 router and 2 switches in a line topology",
    run: () => {
      const newNodes: Node[] = [
        {
          id: "router-1",
          type: "router",
          name: "Router 1",
          Ports: [
            {
              id: "port-r1-1",
              name: "GigabitEthernet0/0",
              status: "active",
              deviceId: "router-1",
            },
            {
              id: "port-r1-2",
              name: "GigabitEthernet0/1",
              status: "active",
              deviceId: "router-1",
            },
          ],
        },
        {
          id: "switch-1",
          type: "switch",
          name: "Switch 1",
          Ports: [
            {
              id: "port-s1-1",
              name: "GigabitEthernet1/0/1",
              status: "active",
              deviceId: "switch-1",
            },
            {
              id: "port-s1-2",
              name: "GigabitEthernet1/0/2",
              status: "active",
              deviceId: "switch-1",
            },
          ],
        },
        {
          id: "switch-2",
          type: "switch",
          name: "Switch 2",
          Ports: [
            {
              id: "port-s2-1",
              name: "GigabitEthernet1/0/1",
              status: "active",
              deviceId: "switch-2",
            },
          ],
        },
      ];

      const newLinks: Link[] = [
        {
          id: "link-1",
          type: "cable",
          source: "port-r1-1",
          target: "port-s1-1",
          maxBandwidth: 1000,
          currentBandwidth: 500,
        },
        {
          id: "link-2",
          type: "cable",
          source: "port-s1-2",
          target: "port-s2-1",
          maxBandwidth: 1000,
          currentBandwidth: 300,
        },
      ];

      nodes.value = newNodes;
      links.value = newLinks;

      testResults.value = [
        {
          passed: true,
          message: "Created simple network with 3 devices and 2 links",
        },
      ];
    },
  },
  {
    name: "Ring Topology",
    description: "A ring topology with 4 switches connected in a circle",
    run: () => {
      const newNodes: Node[] = [];
      const newLinks: Link[] = [];

      // Create 4 switches
      for (let i = 0; i < 4; i++) {
        newNodes.push({
          id: `switch-${i}`,
          type: "switch",
          name: `Switch ${i + 1}`,
          Ports: [
            {
              id: `port-s${i}-1`,
              name: "Port 1",
              status: "active",
              deviceId: `switch-${i}`,
            },
            {
              id: `port-s${i}-2`,
              name: "Port 2",
              status: "active",
              deviceId: `switch-${i}`,
            },
          ],
        });
      }

      // Connect them in a ring
      for (let i = 0; i < 4; i++) {
        newLinks.push({
          id: `link-${i}`,
          type: "cable",
          source: `port-s${i}-1`,
          target: `port-s${(i + 1) % 4}-2`,
          maxBandwidth: 1000,
          currentBandwidth: 200 + i * 100,
        });
      }

      nodes.value = newNodes;
      links.value = newLinks;

      testResults.value = [
        { passed: true, message: "Created ring topology with 4 switches" },
      ];
    },
  },
  {
    name: "High Bandwidth Test",
    description: "Tests visualization of links with high bandwidth usage",
    run: () => {
      const newNodes: Node[] = [
        {
          id: "router-1",
          type: "router",
          name: "Router 1",
          Ports: [
            {
              id: "port-r1-1",
              name: "Port 1",
              status: "active",
              deviceId: "router-1",
            },
            {
              id: "port-r1-2",
              name: "Port 2",
              status: "active",
              deviceId: "router-1",
            },
          ],
        },
        {
          id: "switch-1",
          type: "switch",
          name: "Switch 1",
          Ports: [
            {
              id: "port-s1-1",
              name: "Port 1",
              status: "active",
              deviceId: "switch-1",
            },
            {
              id: "port-s1-2",
              name: "Port 2",
              status: "active",
              deviceId: "switch-1",
            },
          ],
        },
      ];

      const newLinks: Link[] = [
        {
          id: "link-normal",
          type: "cable",
          source: "port-r1-1",
          target: "port-s1-1",
          maxBandwidth: 1000,
          currentBandwidth: 300, // 30% usage
        },
        {
          id: "link-high",
          type: "cable",
          source: "port-r1-2",
          target: "port-s1-2",
          maxBandwidth: 1000,
          currentBandwidth: 950, // 95% usage - should be highlighted
        },
      ];

      nodes.value = newNodes;
      links.value = newLinks;

      // Check if high bandwidth link is detected
      const graph = new NetworkGraph();
      newNodes.forEach((node) => graph.addNode(node));
      newLinks.forEach((link) => graph.addLink(link));

      const highLinks = graph.getLinksByBandwidthUsage(80);

      testResults.value = [
        {
          passed: highLinks.length === 1 && highLinks[0].id === "link-high",
          message:
            highLinks.length === 1
              ? "Correctly identified high bandwidth link"
              : "Failed to identify high bandwidth link",
        },
      ];
    },
  },
];

// Run a test
const runTest = (test: (typeof testCases)[0]) => {
  testResults.value = [];
  currentTest.value = {
    name: test.name,
    description: test.description,
  };
  test.run();
};
</script>
