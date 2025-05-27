<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Network Graph Test</h1>

    <!-- Controls -->
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
      <UTabs
        :items="topologyTabs"
        v-model="activeTab"
        @update:modelValue="handleTabChange"
      >
        <template #item="{ item }">
          <div class="p-4">
            <p class="text-sm text-gray-600 mb-2">{{ item.description }}</p>
            <div class="text-sm text-gray-600">
              <p>Nodes: {{ nodes.length }} | Links: {{ links.length }}</p>
            </div>
          </div>
        </template>
      </UTabs>
    </div>

    <!-- Graph -->
    <div
      class="relative bg-gray-50 border border-gray-300 rounded-lg h-[600px]"
    >
      <svg ref="svgRef" class="w-full h-full"></svg>

      <!-- Node Details Sidebar -->
      <div
        v-if="selectedNode"
        class="absolute top-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10"
      >
        <div class="flex justify-between items-center mb-4">
          <div class="font-bold text-lg">{{ selectedNode.name }}</div>
          <div
            class="px-2 py-1 rounded text-xs font-medium"
            :class="{
              'bg-red-100 text-red-800': selectedNode.type === 'router',
              'bg-teal-100 text-teal-800': selectedNode.type === 'switch',
              'bg-yellow-100 text-yellow-800': selectedNode.type === 'isp'
            }"
          >
            {{
              selectedNode.type.charAt(0).toUpperCase() +
              selectedNode.type.slice(1)
            }}
          </div>
        </div>

        <div class="mb-4">
          <h3 class="font-bold mb-2 border-b pb-1">Routing Table</h3>
          <div v-if="routes.length === 0" class="text-gray-500 italic">
            No routes available
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="(route, index) in routes"
              :key="index"
              class="p-2 bg-gray-100 rounded text-sm"
            >
              <div class="font-medium">
                Destination: {{ route.destination }}
              </div>
              <div>Next Hop: {{ route.nextHop }}</div>
              <div>Interface: {{ route.interface }}</div>
              <div>Metric: {{ route.metric }}</div>
              <div v-if="route.path" class="text-xs text-gray-500 mt-1">
                Path: {{ route.path }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-bold mb-2 border-b pb-1">Connected Devices</h3>
          <div v-if="connectedNodes.length === 0" class="text-gray-500 italic">
            No connected devices
          </div>
          <div v-else class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="node in connectedNodes"
              :key="node.id"
              class="p-2 bg-gray-100 rounded text-sm flex items-center cursor-pointer hover:bg-gray-200"
              @click.stop="selectNode(node)"
            >
              <div
                class="w-3 h-3 rounded-full mr-2"
                :class="{
                  'bg-red-500': node.type === 'router',
                  'bg-teal-500': node.type === 'switch',
                  'bg-yellow-500': node.type === 'isp'
                }"
              ></div>
              <div>{{ node.name }}</div>
              <div v-if="getLinkBandwidth(selectedNode.id, node.id)" class="ml-auto text-xs">
                {{ getLinkBandwidth(selectedNode.id, node.id).currentBandwidth }}/{{ getLinkBandwidth(selectedNode.id, node.id).maxBandwidth }} Mbps
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import * as d3 from "d3";

// Network data
const nodes = ref([]);
const links = ref([]);
const selectedNode = ref(null);
const svgRef = ref(null);
const routes = ref([]);
const activeTab = ref("sanLuis");

// Topology tabs
const topologyTabs = [
  {
    id: "sanLuis",
    label: "San Luis",
    description: "Network topology for San Luis region",
    icon: "i-heroicons-map",
  },
  {
    id: "piedrasNegras",
    label: "Piedras Negras",
    description: "Network topology for Piedras Negras region",
    icon: "i-heroicons-map-pin",
  },
];

// Handle tab change
const handleTabChange = (tabId) => {
  console.log("Tab changed to:", tabId);
  if (tabId === "sanLuis") {
    generateSanLuisTopology();
  } else if (tabId === "piedrasNegras") {
    generatePiedrasNegrasTopology();
  }
};

// D3 simulation
let simulation = null;

// Get connected nodes for the selected node
const connectedNodes = computed(() => {
  if (!selectedNode.value) return [];

  // Find all links connected to this node
  const connectedLinks = links.value.filter((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;
    return (
      sourceId === selectedNode.value.id || targetId === selectedNode.value.id
    );
  });

  // Get the nodes on the other end of these links
  return connectedLinks
    .map((link) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      const connectedNodeId =
        sourceId === selectedNode.value.id ? targetId : sourceId;
      return nodes.value.find((n) => n.id === connectedNodeId);
    })
    .filter(Boolean); // Filter out any undefined nodes
});

// Find ISP nodes in the network
const ispNodes = computed(() => {
  return nodes.value.filter(node => node.type === 'isp');
});

// Select a node
const selectNode = (node) => {
  selectedNode.value = node;
  generateRoutesForNode(node);
  console.log('Selected node:', node);
};

// Calculate the best path to an ISP using Dijkstra's algorithm
const findBestPathToISP = (startNodeId, ispId) => {
  // Initialize distances with infinity for all nodes except the start node
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  
  nodes.value.forEach(node => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });
  
  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    let current = null;
    let smallestDistance = Infinity;
    
    unvisited.forEach(nodeId => {
      if (distances[nodeId] < smallestDistance) {
        smallestDistance = distances[nodeId];
        current = nodeId;
      }
    });
    
    // If we can't find a node or we've reached the ISP, we're done
    if (current === null || current === ispId) break;
    
    // Remove the current node from unvisited
    unvisited.delete(current);
    
    // Find all neighbors of the current node
    const neighbors = [];
    links.value.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === current && unvisited.has(targetId)) {
        // Calculate weight based on bandwidth usage (higher usage = higher weight)
        const weight = link.currentBandwidth ? 1 + (link.currentBandwidth / link.maxBandwidth) : 1;
        neighbors.push({ id: targetId, weight });
      } else if (targetId === current && unvisited.has(sourceId)) {
        const weight = link.currentBandwidth ? 1 + (link.currentBandwidth / link.maxBandwidth) : 1;
        neighbors.push({ id: sourceId, weight });
      }
    });
    
    // Update distances to neighbors
    neighbors.forEach(neighbor => {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.id]) {
        distances[neighbor.id] = alt;
        previous[neighbor.id] = current;
      }
    });
  }
  
  // Reconstruct the path
  const path = [];
  let current = ispId;
  
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  // If the path doesn't start with our start node, there's no path
  if (path.length === 0 || path[0] !== startNodeId) {
    return null;
  }
  
  return path;
};

// Generate routes for the selected node to reach ISPs
const generateRoutesForNode = (node) => {
  // Clear previous routes
  routes.value = [];
  
  if (!node) return;
  
  console.log('Generating routes for node:', node.id);
  
  // Find all ISP nodes
  const isps = ispNodes.value;
  if (isps.length === 0) return;
  
  // For each ISP, find the best path
  isps.forEach(isp => {
    const path = findBestPathToISP(node.id, isp.id);
    
    if (!path || path.length <= 1) {
      // No path found
      routes.value.push({
        destination: `${isp.name} (${isp.id})`,
        nextHop: 'Unreachable',
        interface: 'N/A',
        metric: Infinity
      });
      return;
    }
    
    // Get the next hop in the path
    const nextHopId = path[1];
    const nextHopNode = nodes.value.find(n => n.id === nextHopId);
    
    if (!nextHopNode) return;
    
    // Find the link between current node and next hop
    const link = links.value.find(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return (sourceId === node.id && targetId === nextHopId) || 
             (sourceId === nextHopId && targetId === node.id);
    });
    
    // Calculate metric based on path length and bandwidth usage
    let metric = path.length - 1; // Base metric is hop count
    
    // Add bandwidth factor if available
    if (link && link.maxBandwidth && link.currentBandwidth) {
      const usageRatio = link.currentBandwidth / link.maxBandwidth;
      // Higher bandwidth usage increases the metric
      metric += usageRatio * 5;
    }
    
    // Create the route entry
    routes.value.push({
      destination: `${isp.name} (${isp.id})`,
      nextHop: nextHopNode.name,
      interface: `Port-${Math.floor(Math.random() * 8) + 1}`,
      metric: Math.round(metric * 10) / 10, // Round to 1 decimal place
      path: path.map(id => nodes.value.find(n => n.id === id).name).join(' → ')
    });
  });
  
  // Sort routes by metric (best routes first)
  routes.value.sort((a, b) => a.metric - b.metric);
  
  // Add a default route using the best ISP route
  if (routes.value.length > 0 && routes.value[0].nextHop !== 'Unreachable') {
    routes.value.push({
      destination: '0.0.0.0/0 (Default)',
      nextHop: routes.value[0].nextHop,
      interface: routes.value[0].interface,
      metric: routes.value[0].metric
    });
  }
  
  console.log('Generated routes:', routes.value);
};

// Generate San Luis topology with ISPs and bandwidth info
const generateSanLuisTopology = () => {
  console.log("Generating San Luis topology");
  nodes.value = [
    { id: 'router1', name: 'Core Acuña', type: 'router' },
    { id: 'router2', name: 'Core Apolo', type: 'router' },
    { id: 'router3', name: 'Core Sispa', type: 'router' },
    { id: 'router4', name: 'Core Morelos', type: 'router' },
    { id: 'router5', name: 'Core Villa Union', type: 'router' },
    { id: 'router6', name: 'Core MTP Guerrero', type: 'router' },
    { id: 'router7', name: 'Core Border Piedras Negras', type: 'router' },
    { id: 'router8', name: 'Core Border Telco', type: 'router' },
    { id: 'switch1', name: 'SW PoE Acuña', type: 'switch' },
    { id: 'switch2', name: 'SW PoE San Carlos', type: 'switch' },
    { id: 'switch3', name: 'SW RB2011 Sispa', type: 'switch' },
    { id: 'switch4', name: 'SW PoE PDN', type: 'switch' },
    { id: 'isp1', name: 'Carrier Fibranet', type: 'isp' },
    { id: 'isp2', name: 'Carrier Movistar', type: 'isp' },
    { id: 'isp3', name: 'Carrier Fibranet', type: 'isp' }
  ];
  
  links.value = [
      { id: 'link1', source: 'isp1', target: 'router1', value: 1, maxBandwidth: 500, currentBandwidth: 300 },
    { id: 'link2', source: 'router1', target: 'switch1', value: 1, maxBandwidth: 720, currentBandwidth: 300 },
    { id: 'link3', source: 'switch1', target: 'router2', value: 1, maxBandwidth: 720, currentBandwidth: 500 },
    { id: 'link4', source: 'router2', target: 'switch2', value: 1, maxBandwidth: 100, currentBandwidth: 20 },
    { id: 'link5', source: 'switch2', target: 'router3', value: 1, maxBandwidth: 150, currentBandwidth: 30 },
    { id: 'link6', source: 'router3', target: 'switch3', value: 1, maxBandwidth: 210, currentBandwidth: 20 },
    { id: 'link7', source: 'router3', target: 'switch4', value: 1, maxBandwidth: 480, currentBandwidth: 200 },
    { id: 'link8', source: 'switch4', target: 'router4', value: 1, maxBandwidth: 180, currentBandwidth: 20 },
    { id: 'link9', source: 'router4', target: 'router5', value: 1, maxBandwidth: 50, currentBandwidth: 5 },
    { id: 'link10', source: 'router5', target: 'router6', value: 1, maxBandwidth: 100, currentBandwidth: 20 },
    { id: 'link11', source: 'switch4', target: 'router7', value: 1, maxBandwidth: 480, currentBandwidth: 200 },
    { id: 'link12', source: 'router7', target: 'router8', value: 1, maxBandwidth: 210, currentBandwidth: 20 },
    { id: 'link13', source: 'router7', target: 'isp2', value: 1, maxBandwidth: 500, currentBandwidth: 200 },
    { id: 'link14', source: 'router7', target: 'isp3', value: 1, maxBandwidth: 1000, currentBandwidth: 200 }
  ];
  
  selectedNode.value = null;
  routes.value = [];
  renderGraph();
};

// Generate Piedras Negras topology with ISPs and bandwidth info
const generatePiedrasNegrasTopology = () => {
  console.log("Generating Piedras Negras topology");
  nodes.value = [
    { id: 'router1', name: 'PN-Router-Principal', type: 'router' },
    { id: 'router2', name: 'PN-Router-Backup', type: 'router' },
    { id: 'switch1', name: 'PN-Switch-Core', type: 'switch' },
    { id: 'switch2', name: 'PN-Switch-Zona1', type: 'switch' },
    { id: 'switch3', name: 'PN-Switch-Zona2', type: 'switch' },
    { id: 'switch4', name: 'PN-Switch-Zona3', type: 'switch' },
    { id: 'switch5', name: 'PN-Switch-Zona4', type: 'switch' },
    { id: 'isp1', name: 'Telmex', type: 'isp' },
    { id: 'isp2', name: 'AT&T', type: 'isp' }
  ];
  
  links.value = [
    { id: 'link1', source: 'router1', target: 'switch1', value: 1, maxBandwidth: 1000, currentBandwidth: 600 },
    { id: 'link2', source: 'router2', target: 'switch1', value: 1, maxBandwidth: 1000, currentBandwidth: 200 },
    { id: 'link3', source: 'switch1', target: 'switch2', value: 1, maxBandwidth: 1000, currentBandwidth: 300 },
    { id: 'link4', source: 'switch1', target: 'switch3', value: 1, maxBandwidth: 1000, currentBandwidth: 400 },
    { id: 'link5', source: 'switch1', target: 'switch4', value: 1, maxBandwidth: 1000, currentBandwidth: 350 },
    { id: 'link6', source: 'switch1', target: 'switch5', value: 1, maxBandwidth: 1000, currentBandwidth: 250 },
    { id: 'link7', source: 'switch2', target: 'switch3', value: 1, maxBandwidth: 1000, currentBandwidth: 100 },
    { id: 'link8', source: 'switch3', target: 'switch4', value: 1, maxBandwidth: 1000, currentBandwidth: 150 },
    { id: 'link9', source: 'switch4', target: 'switch5', value: 1, maxBandwidth: 1000, currentBandwidth: 200 },
    { id: 'link10', source: 'switch5', target: 'switch2', value: 1, maxBandwidth: 1000, currentBandwidth: 180 },
    { id: 'link11', source: 'router1', target: 'isp1', value: 1, maxBandwidth: 1000, currentBandwidth: 900 },
    { id: 'link12', source: 'router2', target: 'isp2', value: 1, maxBandwidth: 1000, currentBandwidth: 400 }
  ];
  
  selectedNode.value = null;
  routes.value = [];
  renderGraph();
};

// Get link bandwidth information between two nodes
const getLinkBandwidth = (sourceId, targetId) => {
  const link = links.value.find(link => {
    const s = typeof link.source === 'object' ? link.source.id : link.source;
    const t = typeof link.target === 'object' ? link.target.id : link.target;
    return (s === sourceId && t === targetId) || (s === targetId && t === sourceId);
  });
  
  if (link && link.maxBandwidth) {
    return {
      maxBandwidth: link.maxBandwidth,
      currentBandwidth: link.currentBandwidth || 0
    };
  }
  
  return null;
};

// Render the graph using D3
const renderGraph = () => {
  console.log("Rendering graph with nodes:", nodes.value, "and links:", links.value);
  
  if (!svgRef.value) {
    console.error("SVG reference not found");
    return;
  }
  
  // Clear previous graph
  const svg = d3.select(svgRef.value);
  svg.selectAll('*').remove();
  
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;
  
  console.log(`Graph dimensions: ${width}x${height}`);
  
  // Create a group for the graph
  const g = svg.append('g');
  
  // Define node colors based on type
  const nodeColor = d => {
    if (d.type === 'router') return '#ff6b6b';
    if (d.type === 'switch') return '#4ecdc4';
    if (d.type === 'isp') return '#ffd166';
    return '#aaa';
  };
  
  // Define node shapes based on type
  const nodeShape = (d, i, nodes) => {
    const element = d3.select(nodes[i]);
    if (d.type === 'isp') {
      // Create a cloud shape for ISP
      element.append('circle')
        .attr('r', 15)
        .attr('fill', nodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      
      // Add a small icon or decoration to indicate ISP
      element.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('ISP');
    } else {
      // Regular circle for other nodes
      element.append('circle')
        .attr('r', 15)
        .attr('fill', nodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }
  };
  
  // Create links with thickness based on bandwidth usage
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links.value)
    .enter().append('line')
    .attr('stroke', d => {
      // Color links based on bandwidth usage
      if (d.maxBandwidth && d.currentBandwidth) {
        const usage = d.currentBandwidth / d.maxBandwidth;
        if (usage > 0.8) return '#ff0000'; // Red for high usage
        if (usage > 0.5) return '#ff9900'; // Orange for medium usage
        return '#999'; // Default gray for low usage
      }
      return '#999';
    })
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => {
      // Thicker lines for higher bandwidth links
      if (d.maxBandwidth) {
        return 1 + (d.maxBandwidth / 500);
      }
      return 2;
    });
  
  // Add bandwidth labels to links
  const linkLabels = g.append('g')
    .attr('class', 'link-labels')
    .selectAll('text')
    .data(links.value)
    .enter().append('text')
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')
    .attr('dy', -5)
    .attr('fill', d => {
      if (d.maxBandwidth && d.currentBandwidth) {
        const usage = d.currentBandwidth / d.maxBandwidth;
        if (usage > 0.8) return '#ff0000'; // Red for high usage
        if (usage > 0.5) return '#ff9900'; // Orange for medium usage
        return '#666'; // Default dark gray for low usage
      }
      return '#666';
    })
    .text(d => {
      if (d.maxBandwidth && d.currentBandwidth) {
        return `${d.currentBandwidth}/${d.maxBandwidth} Mbps`;
      }
      return '';
    })
    .attr('background', 'white');
  
  // Add white background for better readability
  const linkLabelBg = g.append('g')
    .attr('class', 'link-label-bg')
    .selectAll('rect')
    .data(links.value)
    .enter().append('rect')
    .attr('fill', 'white')
    .attr('opacity', 0.7)
    .attr('rx', 3)
    .attr('ry', 3);
  
  // Create nodes
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes.value)
    .enter().append('g')
    .attr('class', 'node')
    .on('click', (event, d) => {
      event.stopPropagation();
      selectNode(d);
    })
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded));
  
  // Add shapes to nodes based on type
  node.each(nodeShape);
  
  // Add labels to nodes
  node.append('text')
    .attr('dy', 30)
    .attr('text-anchor', 'middle')
    .text(d => d.name)
    .attr('font-size', '12px');
  
  // Add click handler to clear selection when clicking on the background
  svg.on('click', () => {
    selectedNode.value = null;
    routes.value = [];
  });
  
  // Create simulation
  simulation = d3.forceSimulation(nodes.value)
    .force('link', d3.forceLink(links.value).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked);
  
  // Update positions on each tick
  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    
    // Position the link labels at the middle of each link
    linkLabels
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);
    
    // Position and size the background rectangles for link labels
    linkLabelBg
      .attr('x', d => {
        const labelWidth = `${d.currentBandwidth}/${d.maxBandwidth} Mbps`.length * 5.5;
        return (d.source.x + d.target.x) / 2 - labelWidth / 2;
      })
      .attr('y', d => (d.source.y + d.target.y) / 2 - 15)
      .attr('width', d => `${d.currentBandwidth}/${d.maxBandwidth} Mbps`.length * 5.5)
      .attr('height', 16);
    
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  }
  
  // Drag functions
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  // Update node highlighting for the selected node
  updateNodeHighlighting();
};

// Update node highlighting based on selected node
const updateNodeHighlighting = () => {
  if (!svgRef.value) return;

  d3.select(svgRef.value)
    .selectAll(".node circle")
    .attr("stroke", (d) => {
      return selectedNode.value && d.id === selectedNode.value.id
        ? "#333"
        : "#fff";
    })
    .attr("stroke-width", (d) => {
      return selectedNode.value && d.id === selectedNode.value.id ? 3 : 2;
    });
};

// Watch for changes to selectedNode to update the node highlighting
watch(selectedNode, () => {
  updateNodeHighlighting();
});

// Initialize with San Luis topology
onMounted(() => {
  console.log("Component mounted");
  setTimeout(() => {
    generateSanLuisTopology();
  }, 100); // Small delay to ensure DOM is ready
});
</script>





