<template>
  <div class="relative bg-gray-50 border border-gray-300 rounded-lg h-[600px]">
    <svg ref="svgRef" class="w-full h-full"></svg>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'

interface Node {
  id: string
  name: string
  type: 'router' | 'switch' | 'isp'
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  id: string
  source: string | Node
  target: string | Node
  value: number
  maxBandwidth?: number
  currentBandwidth?: number
}

interface Props {
  nodes: Node[]
  links: Link[]
  selectedNode: Node | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'node-selected': [node: Node]
  'node-deselected': []
}>()

const svgRef = ref<SVGElement | null>(null)
let simulation: any = null

// Watch for changes in nodes/links to re-render
watch([() => props.nodes, () => props.links], () => {
  renderGraph()
}, { deep: true })

// Watch for selected node changes to update highlighting
watch(() => props.selectedNode, () => {
  updateNodeHighlighting()
})

onMounted(() => {
  setTimeout(() => {
    renderGraph()
  }, 100)
})

const renderGraph = () => {
  console.log('NetworkGraph renderGraph called', {
    nodes: props.nodes,
    links: props.links,
    svgRef: svgRef.value
  })

  if (!svgRef.value || !props.nodes.length) {
    console.log('NetworkGraph early return', {
      svgRef: !!svgRef.value,
      nodesLength: props.nodes.length
    })
    return
  }

  // Clear previous graph
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const width = svg.node()!.getBoundingClientRect().width
  const height = svg.node()!.getBoundingClientRect().height

  console.log('NetworkGraph dimensions', { width, height })

  // Create a group for the graph
  const g = svg.append('g')

  // Define node colors based on type
  const nodeColor = (d: Node) => {
    if (d.type === 'router') return '#ff6b6b'
    if (d.type === 'switch') return '#4ecdc4'
    if (d.type === 'isp') return '#ffd166'
    return '#aaa'
  }

  // Create simulation with proper node data
  const nodesCopy = props.nodes.map(d => ({ ...d }))
  const linksCopy = props.links.map(d => ({ ...d }))

  // Create links with thickness based on bandwidth usage
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(linksCopy)
    .enter().append('line')
    .attr('stroke', (d: Link) => {
      if (d.maxBandwidth && d.currentBandwidth) {
        const usage = d.currentBandwidth / d.maxBandwidth
        if (usage > 0.8) return '#ff0000'
        if (usage > 0.5) return '#ff9900'
        return '#999'
      }
      return '#999'
    })
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: Link) => {
      if (d.maxBandwidth) {
        return 1 + (d.maxBandwidth / 500)
      }
      return 2
    })

  // Add bandwidth labels to links
  const linkLabels = g.append('g')
    .attr('class', 'link-labels')
    .selectAll('text')
    .data(linksCopy)
    .enter().append('text')
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')
    .attr('dy', -5)
    .attr('fill', (d: Link) => {
      if (d.maxBandwidth && d.currentBandwidth) {
        const usage = d.currentBandwidth / d.maxBandwidth
        if (usage > 0.8) return '#ff0000'
        if (usage > 0.5) return '#ff9900'
        return '#666'
      }
      return '#666'
    })
    .text((d: Link) => {
      if (d.maxBandwidth && d.currentBandwidth) {
        return `${d.currentBandwidth}/${d.maxBandwidth} Mbps`
      }
      return ''
    })

  // Add white background for better readability
  const linkLabelBg = g.append('g')
    .attr('class', 'link-label-bg')
    .selectAll('rect')
    .data(linksCopy)
    .enter().append('rect')
    .attr('fill', 'white')
    .attr('opacity', 0.7)
    .attr('rx', 3)
    .attr('ry', 3)

  // Create nodes
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodesCopy)
    .enter().append('g')
    .attr('class', 'node')
    .on('click', (event: MouseEvent, d: Node) => {
      event.stopPropagation()
      emit('node-selected', d)
    })
    .call(d3.drag<any, any>()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded))

  // Add shapes to nodes
  node.each(function(d: Node) {
    const element = d3.select(this)
    if (d.type === 'isp') {
      element.append('circle')
        .attr('r', 15)
        .attr('fill', nodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      element.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('ISP')
    } else {
      element.append('circle')
        .attr('r', 15)
        .attr('fill', nodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
    }
  })

  // Add labels to nodes
  node.append('text')
    .attr('dy', 30)
    .attr('text-anchor', 'middle')
    .text((d: Node) => d.name)
    .attr('font-size', '12px')

  // Add click handler to clear selection
  svg.on('click', () => {
    emit('node-deselected')
  })

  simulation = d3.forceSimulation(nodesCopy)
    .force('link', d3.forceLink(linksCopy).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked)

  function ticked() {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    linkLabels
      .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2)

    linkLabelBg
      .attr('x', (d: any) => {
        const labelWidth = `${d.currentBandwidth}/${d.maxBandwidth} Mbps`.length * 5.5
        return (d.source.x + d.target.x) / 2 - labelWidth / 2
      })
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 15)
      .attr('width', (d: any) => `${d.currentBandwidth}/${d.maxBandwidth} Mbps`.length * 5.5)
      .attr('height', 16)

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  }

  function dragStarted(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: any, d: any) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragEnded(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  updateNodeHighlighting()
}

const updateNodeHighlighting = () => {
  if (!svgRef.value) return

  d3.select(svgRef.value)
    .selectAll('.node circle')
    .attr('stroke', (d: any) => {
      return props.selectedNode && d.id === props.selectedNode.id ? '#333' : '#fff'
    })
    .attr('stroke-width', (d: any) => {
      return props.selectedNode && d.id === props.selectedNode.id ? 3 : 2
    })
}
</script>
