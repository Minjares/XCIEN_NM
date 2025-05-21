<template>
  <div class="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
    <svg ref="svgRef" width="100%" height="600"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import type { Node, Link } from '~/types/network';

// Import d3 modules individually to avoid ESM issues
import { select, selectAll } from 'd3-selection';
import { drag } from 'd3-drag';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';

// Import types from d3 packages
import type { Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import type { Selection } from 'd3-selection';
import type { D3DragEvent } from 'd3-drag';

// Create a d3 object with the modules we need
const d3 = {
  select,
  selectAll,
  drag,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY
};

// Get router
const router = useRouter();

// Define props
const props = defineProps<{
  nodes: Node[];
  links: Link[];
  selectedNodeId?: string | null;
}>();

// Define emits
const emit = defineEmits<{
  'node-added': [node: Node];
  'node-removed': [nodeId: string];
  'link-created': [link: Link];
  'node-selected': [nodeId: string];
}>();

// Reference to the SVG element
const svgRef = ref<SVGElement | null>(null);

// D3 simulation
let simulation: Simulation<Node, SimulationLinkDatum<Node>> | null = null;

// D3 selections
let nodeElements: Selection<SVGGElement, Node, SVGGElement, unknown>;
let linkElements: Selection<SVGLineElement, Link, SVGGElement, unknown>;

// Load node positions from localStorage
const loadNodePositions = () => {
  if (process.client) {
    const storedPositions = localStorage.getItem('network_node_positions');
    if (storedPositions) {
      try {
        const positions = JSON.parse(storedPositions);

        // Get SVG dimensions for boundary checking
        const width = svgRef.value?.clientWidth || 800;
        const height = svgRef.value?.clientHeight || 600;
        const centerX = width / 2;
        const centerY = height / 2;

        // Apply stored positions to nodes
        props.nodes.forEach(node => {
          if (positions[node.id]) {
            // Check if the position is within the visible area
            const x = positions[node.id].x;
            const y = positions[node.id].y;

            // If position is outside the visible area, reset to center area
            if (x < 0 || x > width || y < 0 || y > height) {
              // Position in a circle around center
              const angle = Math.random() * 2 * Math.PI;
              const radius = 150;
              node.x = centerX + radius * Math.cos(angle);
              node.y = centerY + radius * Math.sin(angle);
              node.fx = node.x;
              node.fy = node.y;
            } else {
              // Use stored position
              node.x = x;
              node.y = y;
              node.fx = x;
              node.fy = y;
            }
          }
        });
      } catch (error) {
        console.error('Error loading node positions:', error);
      }
    }
  }
};

// Save node positions to localStorage
const saveNodePositions = () => {
  if (process.client && props.nodes.length > 0) {
    const positions = {};
    props.nodes.forEach(node => {
      if (node.x && node.y) {
        positions[node.id] = {
          x: node.x,
          y: node.y
        };
      }
    });
    localStorage.setItem('network_node_positions', JSON.stringify(positions));
  }
};

// Initialize the graph
const initGraph = () => {
  if (!svgRef.value) return;

  // Load saved node positions before initializing the graph
  loadNodePositions();

  // Clear the SVG
  d3.select(svgRef.value).selectAll('*').remove();

  // Create the SVG groups
  const svg = d3.select(svgRef.value);
  const width = svg.node()?.getBoundingClientRect().width || 800;
  const height = svg.node()?.getBoundingClientRect().height || 600;

  // Add background rect to handle deselection
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'transparent')
    .on('click', () => {
      emit('node-selected', ''); // Deselect by sending empty string
    });

  // Create a group for links and nodes
  const g = svg.append('g');

  // Create link elements
  linkElements = g
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(props.links)
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 2);

  // Create node elements
  nodeElements = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(props.nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .on('click', (event, d) => {
      event.stopPropagation(); // Prevent bubbling

      // Navigate to node detail page
      if (process.client) {
        // Save nodes and links to localStorage for the node detail page
        localStorage.setItem('network_nodes', JSON.stringify(props.nodes));
        localStorage.setItem('network_links', JSON.stringify(props.links));

        // Save node positions to localStorage
        saveNodePositions();

        // Navigate to node detail page using router for better SPA experience
        navigateTo(`/node/${d.id}`);
      }
    })
    .call(d3.drag<SVGGElement, Node>()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded)
    );

  // Add images to nodes
  nodeElements
    .append('image')
    .attr('xlink:href', d => d.type === 'router' ? '/router.svg' : '/switch.svg')
    .attr('width', 40)
    .attr('height', 40)
    .attr('x', -20)
    .attr('y', -20);

  // Add text labels to nodes
  nodeElements
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '30px')
    .attr('fill', '#333')
    .attr('font-size', '12px')
    .text(d => d.name);

  // Add title for hover tooltip
  nodeElements
    .append('title')
    .text(d => d.name);

  // Create the simulation with adjusted forces to keep nodes centered and prevent excessive movement
  simulation = d3.forceSimulation<Node>(props.nodes)
    // Link force with reduced distance to keep connected nodes closer
    .force('link', d3.forceLink<Node, Link>(props.links).id(d => d.id).distance(100))
    // Reduced repulsion force to prevent nodes from moving too far apart
    .force('charge', d3.forceManyBody().strength(-150).distanceMax(300))
    // Stronger centering force to keep nodes in the center of the view
    .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
    // Add collision force to prevent node overlap
    .force('collision', d3.forceCollide().radius(50))
    // Add boundary force to keep nodes within the visible area
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .on('tick', ticked);

  // Position nodes after initial layout, but allow some flexibility for new connections
  simulation.on('end', () => {
    // Only fix positions of nodes that don't have fixed positions yet
    // This allows new nodes to find their optimal position
    props.nodes.forEach(node => {
      // If the node already has a fixed position from localStorage, keep it
      if (!node.fx && !node.fy) {
        // Set fixed position to current position
        node.fx = node.x;
        node.fy = node.y;
      }
    });

    // Save node positions to localStorage
    saveNodePositions();
  });
};

// Update the graph when data changes
const updateGraph = () => {
  if (!svgRef.value || !simulation) return;

  // Find new nodes (nodes without positions)
  const newNodes = props.nodes.filter(node => !node.x && !node.y);

  // If there are new nodes, position them near the center
  if (newNodes.length > 0) {
    const width = svgRef.value.clientWidth || 800;
    const height = svgRef.value.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Position new nodes in a circle around the center
    newNodes.forEach((node, i) => {
      const angle = (i / newNodes.length) * 2 * Math.PI;
      const radius = 150; // Distance from center
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  }

  // Update the simulation with new data
  simulation.nodes(props.nodes);
  const linkForce = simulation.force('link') as d3.ForceLink<Node, Link>;
  if (linkForce) {
    linkForce.links(props.links);
  }

  // Update link elements
  linkElements = d3.select(svgRef.value)
    .select('.links')
    .selectAll('line')
    .data(props.links);

  linkElements.exit().remove();

  const linkEnter = linkElements
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 2);

  linkElements = linkEnter.merge(linkElements as any);

  // Update node elements
  nodeElements = d3.select(svgRef.value)
    .select('.nodes')
    .selectAll('g.node')
    .data(props.nodes);

  nodeElements.exit().remove();

  const nodeEnter = nodeElements
    .enter()
    .append('g')
    .attr('class', 'node')
    .on('click', (event, d) => {
      event.stopPropagation(); // Prevent bubbling

      // Navigate to node detail page
      if (process.client) {
        // Save nodes and links to localStorage for the node detail page
        localStorage.setItem('network_nodes', JSON.stringify(props.nodes));
        localStorage.setItem('network_links', JSON.stringify(props.links));

        // Save node positions to localStorage
        saveNodePositions();

        // Navigate to node detail page using router for better SPA experience
        navigateTo(`/node/${d.id}`);
      }
    })
    .call(d3.drag<SVGGElement, Node>()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded)
    );

  nodeEnter
    .append('image')
    .attr('xlink:href', d => d.type === 'router' ? '/router.svg' : '/switch.svg')
    .attr('width', 40)
    .attr('height', 40)
    .attr('x', -20)
    .attr('y', -20);

  nodeEnter
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '30px')
    .attr('fill', '#333')
    .attr('font-size', '12px')
    .text(d => d.name);

  nodeEnter
    .append('title')
    .text(d => d.name);

  nodeElements = nodeEnter.merge(nodeElements as any);

  // Restart the simulation
  simulation.alpha(1).restart();

  // Update node selection
  updateNodeSelection();
};

// Update positions on each tick of the simulation
const ticked = () => {
  linkElements
    .attr('x1', d => (d.source as Node).x || 0)
    .attr('y1', d => (d.source as Node).y || 0)
    .attr('x2', d => (d.target as Node).x || 0)
    .attr('y2', d => (d.target as Node).y || 0);

  nodeElements
    .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
};

// Drag functions - allow limited movement for better positioning
const dragStarted = (event: D3DragEvent<SVGGElement, Node, Node>, d: Node) => {
  event.sourceEvent.stopPropagation();

  // Temporarily unfix the node position during drag
  d.fx = null;
  d.fy = null;

  // Restart simulation with a low alpha to allow movement
  if (simulation) simulation.alphaTarget(0.1).restart();
};

const dragged = (event: D3DragEvent<SVGGElement, Node, Node>, d: Node) => {
  // Update node position during drag
  d.fx = event.x;
  d.fy = event.y;
};

const dragEnded = (event: D3DragEvent<SVGGElement, Node, Node>, d: Node) => {
  // Fix the node at its new position
  d.fx = event.x;
  d.fy = event.y;

  // Stop the simulation
  if (simulation) simulation.alphaTarget(0);

  // Save the new positions
  saveNodePositions();
};

// Update node selection
const updateNodeSelection = () => {
  if (!svgRef.value) return;

  d3.select(svgRef.value)
    .selectAll('.node')
    .classed('selected', d => d.id === props.selectedNodeId);
};

// Watch for changes in props
watch(() => props.nodes, (newNodes, oldNodes) => {
  nextTick(() => {
    // Check if nodes were added
    const nodesAdded = newNodes.length > (oldNodes?.length || 0);

    // Update the graph
    updateGraph();

    // If nodes were added, run the simulation for a bit to find good positions
    if (nodesAdded && simulation) {
      // Run the simulation with higher alpha to allow movement
      simulation.alpha(0.3).restart();

      // Save positions after the simulation settles
      simulation.on('end', () => {
        // Fix positions of new nodes
        newNodes.forEach(node => {
          if (node.x && node.y && (!node.fx || !node.fy)) {
            node.fx = node.x;
            node.fy = node.y;
          }
        });

        // Save all positions
        saveNodePositions();
      });
    } else {
      // Just save positions without running simulation
      saveNodePositions();
    }
  });
}, { deep: true });

watch(() => props.links, (newLinks, oldLinks) => {
  nextTick(() => {
    // Check if links were added
    const linksAdded = newLinks.length > (oldLinks?.length || 0);

    // Update the graph
    updateGraph();

    // If links were added, run the simulation briefly to adjust positions
    if (linksAdded && simulation) {
      // Run with lower alpha to allow minor adjustments
      simulation.alpha(0.1).restart();
    }
  });
}, { deep: true });

watch(() => props.selectedNodeId, () => {
  nextTick(() => updateNodeSelection());
});

// Initialize the graph on mount
onMounted(() => {
  initGraph();
  updateNodeSelection();
});
</script>

<style scoped>
:deep(.node) {
  cursor: pointer;
}

:deep(.node.selected image) {
  filter: drop-shadow(0 0 8px rgba(76, 175, 80, 0.8));
}

:deep(.node text) {
  pointer-events: none;
  font-weight: bold;
  font-size: 12px;
  fill: #333;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

:deep(.links line) {
  stroke: #7f8c8d;
  stroke-width: 2px;
  stroke-opacity: 0.6;
}
</style>
