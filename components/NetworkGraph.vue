<template>
  <div class="relative bg-gray-50 border border-gray-300 rounded-lg h-[600px]">
    <svg ref="svgRef" class="w-full h-full cursor-grab"></svg>

    <!-- Zoom Controls -->
    <div class="absolute top-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
      <UButton
        icon="i-heroicons-plus"
        size="sm"
        variant="outline"
        @click="zoomIn"
        title="Zoom In (Ctrl/Cmd + +)"
      />
      <UButton
        icon="i-heroicons-minus"
        size="sm"
        variant="outline"
        @click="zoomOut"
        title="Zoom Out (Ctrl/Cmd + -)"
      />
      <UButton
        icon="i-heroicons-arrow-path"
        size="sm"
        variant="outline"
        @click="resetZoom"
        title="Reset View (Ctrl/Cmd + 0)"
      />
    </div>

    <!-- Zoom Level Indicator -->
    <div class="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-3 py-1 text-sm text-gray-600">
      Zoom: {{ Math.round(currentZoom * 100) }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import type { Node, Link } from '~/types/network'

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
let zoomBehavior: any = null
let svgGroup: any = null

// Zoom state
const currentZoom = ref(1)
const minZoom = 0.1
const maxZoom = 5

// Watch for changes in nodes/links to re-render
watch([() => props.nodes, () => props.links], () => {
  renderGraph()
}, { deep: true })

// Watch for selected node changes to update highlighting
watch(() => props.selectedNode, () => {
  updateNodeHighlighting()
})

// Zoom control functions
const zoomIn = () => {
  if (zoomBehavior && svgRef.value) {
    const svg = d3.select(svgRef.value)
    svg.transition().duration(300).call(
      zoomBehavior.scaleBy, 1.5
    )
  }
}

const zoomOut = () => {
  if (zoomBehavior && svgRef.value) {
    const svg = d3.select(svgRef.value)
    svg.transition().duration(300).call(
      zoomBehavior.scaleBy, 1 / 1.5
    )
  }
}

const resetZoom = () => {
  if (zoomBehavior && svgRef.value) {
    const svg = d3.select(svgRef.value)

    svg.transition().duration(500).call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    )
  }
}

// Keyboard shortcuts for zoom
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case '=':
      case '+':
        event.preventDefault()
        zoomIn()
        break
      case '-':
        event.preventDefault()
        zoomOut()
        break
      case '0':
        event.preventDefault()
        resetZoom()
        break
    }
  }
}

onMounted(() => {
  setTimeout(() => {
    renderGraph()
  }, 100)

  // Add keyboard event listeners
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('keydown', handleKeydown)
})

// Helper function to get node ID from port ID
const getNodeIdFromPortId = (portId: string): string => {
  const allPorts = props.nodes.flatMap(node => node.Ports)
  const port = allPorts.find(p => p.id === portId)
  return port ? port.deviceId : portId
}

// Helper function to convert port-based links to node-based links for D3
const convertLinksForD3 = (links: Link[]): any[] => {
  const convertedLinks = links.map(link => ({
    ...link,
    source: typeof link.source === 'string' ? getNodeIdFromPortId(link.source) : getNodeIdFromPortId(link.source.id),
    target: typeof link.target === 'string' ? getNodeIdFromPortId(link.target) : getNodeIdFromPortId(link.target.id),
    originalSource: link.source,
    originalTarget: link.target
  }))

  // Group links by node pairs and add curve offset for multiple links
  const linkGroups = new Map<string, any[]>()

  convertedLinks.forEach(link => {
    const key = [link.source, link.target].sort().join('-')
    if (!linkGroups.has(key)) {
      linkGroups.set(key, [])
    }
    linkGroups.get(key)!.push(link)
  })

  // Add curve offset for multiple links between same nodes
  linkGroups.forEach(group => {
    if (group.length > 1) {
      group.forEach((link, index) => {
        link.curveOffset = (index - (group.length - 1) / 2) * 30
        link.isMultiple = true
      })
    } else {
      group[0].curveOffset = 0
      group[0].isMultiple = false
    }
  })

  return convertedLinks
}

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

  // Create a group for the graph that will be transformed by zoom
  svgGroup = svg.append('g')
  const g = svgGroup

  // Create zoom behavior
  zoomBehavior = d3.zoom()
    .scaleExtent([minZoom, maxZoom])
    .on('zoom', (event) => {
      const { transform } = event
      g.attr('transform', transform)
      currentZoom.value = transform.k
    })

  // Apply zoom behavior to SVG
  svg.call(zoomBehavior)

  // Prevent zoom on double-click (we want to use it for node selection)
  svg.on('dblclick.zoom', null)

  // Define node images based on type
  const getNodeImage = (d: Node) => {
    if (d.type === 'router') return '/router.png'
    if (d.type === 'switch') return '/switch.png'
    if (d.type === 'isp') return '/isp.png'
    return '/router.png' // fallback
  }

  // Create simulation with proper node data
  const nodesCopy = props.nodes.map(d => ({ ...d }))
  const linksCopy = convertLinksForD3(props.links)

  // Create links with thickness based on bandwidth usage
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('path')
    .data(linksCopy)
    .enter().append('path')
    .attr('stroke', (d: any) => {
      if (d.maxBandwidth && d.currentBandwidth) {
        const usage = d.currentBandwidth / d.maxBandwidth
        if (usage > 0.8) return '#ff0000'
        if (usage > 0.5) return '#ff9900'
        return '#999'
      }
      return '#999'
    })
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: any) => {
      if (d.maxBandwidth) {
        return Math.max(1, 1 + (d.maxBandwidth / 500))
      }
      return 2
    })
    .attr('fill', 'none')

  // Add bandwidth labels to links
  const linkLabels = g.append('g')
    .attr('class', 'link-labels')
    .selectAll('text')
    .data(linksCopy)
    .enter().append('text')
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')
    .attr('dy', -5)
    .attr('fill', (d: any) => {
      if (d.maxBandwidth && d.currentBandwidth) {
        const usage = d.currentBandwidth / d.maxBandwidth
        if (usage > 0.8) return '#ff0000'
        if (usage > 0.5) return '#ff9900'
        return '#666'
      }
      return '#666'
    })
    .text((d: any) => {
      if (d.maxBandwidth && d.currentBandwidth) {
        if (d.isMultiple) {
          // Show port information for multiple links
          const sourcePort = typeof d.originalSource === 'string' ? d.originalSource : d.originalSource.id
          const targetPort = typeof d.originalTarget === 'string' ? d.originalTarget : d.originalTarget.id
          return `${d.currentBandwidth}/${d.maxBandwidth} Mbps (${sourcePort.split('-').pop()} → ${targetPort.split('-').pop()})`
        }
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

  // Add images to nodes
  node.each(function(d: Node) {
    // @ts-ignore
    const element = d3.select(this)

    // Add selection circle (initially hidden)
    element.append('circle')
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5')
      .attr('class', 'selection-circle')
      .style('opacity', 0)

    // Add image for all node types
    element.append('image')
      .attr('href', getNodeImage(d))
      .attr('x', -15)
      .attr('y', -15)
      .attr('width', 30)
      .attr('height', 30)
      .attr('class', 'node-image')
      .style('cursor', 'pointer')
  })

  // Add labels to nodes
  node.append('text')
    .attr('dy', 30)
    .attr('text-anchor', 'middle')
    .text((d: Node) => d.name)
    .attr('font-size', '12px')

  // Add click handler to clear selection (but not interfere with zoom)
  svg.on('click', (event) => {
    // Only emit deselection if we're not in the middle of a zoom/pan operation
    if (event.defaultPrevented) return
    emit('node-deselected')
  })

  simulation = d3.forceSimulation(nodesCopy)
    .force('link', d3.forceLink(linksCopy).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked)

  function ticked() {
    link.attr('d', (d: any) => {
      const dx = d.target.x - d.source.x
      const dy = d.target.y - d.source.y
      const dr = Math.sqrt(dx * dx + dy * dy)

      if (d.isMultiple && d.curveOffset !== 0) {
        // Calculate control point for curved path
        const midX = (d.source.x + d.target.x) / 2
        const midY = (d.source.y + d.target.y) / 2

        // Perpendicular offset for curve
        const offsetX = -dy / dr * d.curveOffset
        const offsetY = dx / dr * d.curveOffset

        const controlX = midX + offsetX
        const controlY = midY + offsetY

        return `M${d.source.x},${d.source.y} Q${controlX},${controlY} ${d.target.x},${d.target.y}`
      } else {
        // Straight line for single links
        return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`
      }
    })

    linkLabels
      .attr('x', (d: any) => {
        if (d.isMultiple && d.curveOffset !== 0) {
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          const dr = Math.sqrt(dx * dx + dy * dy)
          const midX = (d.source.x + d.target.x) / 2
          const offsetX = -dy / dr * d.curveOffset * 0.5
          return midX + offsetX
        }
        return (d.source.x + d.target.x) / 2
      })
      .attr('y', (d: any) => {
        if (d.isMultiple && d.curveOffset !== 0) {
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          const dr = Math.sqrt(dx * dx + dy * dy)
          const midY = (d.source.y + d.target.y) / 2
          const offsetY = dx / dr * d.curveOffset * 0.5
          return midY + offsetY
        }
        return (d.source.y + d.target.y) / 2
      })

    linkLabelBg
      .attr('x', (d: any) => {
        let labelText = `${d.currentBandwidth}/${d.maxBandwidth} Mbps`
        if (d.isMultiple) {
          const sourcePort = typeof d.originalSource === 'string' ? d.originalSource : d.originalSource.id
          const targetPort = typeof d.originalTarget === 'string' ? d.originalTarget : d.originalTarget.id
          labelText = `${d.currentBandwidth}/${d.maxBandwidth} Mbps (${sourcePort.split('-').pop()} → ${targetPort.split('-').pop()})`
        }
        const labelWidth = labelText.length * 5.5
        if (d.isMultiple && d.curveOffset !== 0) {
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          const dr = Math.sqrt(dx * dx + dy * dy)
          const midX = (d.source.x + d.target.x) / 2
          const offsetX = -dy / dr * d.curveOffset * 0.5
          return midX + offsetX - labelWidth / 2
        }
        return (d.source.x + d.target.x) / 2 - labelWidth / 2
      })
      .attr('y', (d: any) => {
        if (d.isMultiple && d.curveOffset !== 0) {
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          const dr = Math.sqrt(dx * dx + dy * dy)
          const midY = (d.source.y + d.target.y) / 2
          const offsetY = dx / dr * d.curveOffset * 0.5
          return midY + offsetY - 15
        }
        return (d.source.y + d.target.y) / 2 - 15
      })
      .attr('width', (d: any) => {
        let labelText = `${d.currentBandwidth}/${d.maxBandwidth} Mbps`
        if (d.isMultiple) {
          const sourcePort = typeof d.originalSource === 'string' ? d.originalSource : d.originalSource.id
          const targetPort = typeof d.originalTarget === 'string' ? d.originalTarget : d.originalTarget.id
          labelText = `${d.currentBandwidth}/${d.maxBandwidth} Mbps (${sourcePort.split('-').pop()} → ${targetPort.split('-').pop()})`
        }
        return labelText.length * 5.5
      })
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
    .selectAll('.selection-circle')
    .style('opacity', (d: any) => {
      return props.selectedNode && d.id === props.selectedNode.id ? 1 : 0
    })
}
</script>
