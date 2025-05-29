<template>
  <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
    <NetworkStatsCard
      title="Dispositivos Totales"
      :value="nodes.length"
      icon="i-heroicons-device-phone-mobile"
      color="primary"
    />
    
    <NetworkStatsCard
      title="Routers"
      :value="routerCount"
      icon="i-heroicons-server"
      color="blue"
    />
    
    <NetworkStatsCard
      title="Switches"
      :value="switchCount"
      icon="i-heroicons-squares-2x2"
      color="green"
    />
    
    <NetworkStatsCard
      title="ISPs"
      :value="ispCount"
      icon="i-heroicons-cloud"
      color="yellow"
    />
    
    <NetworkStatsCard
      title="Conexiones"
      :value="links.length"
      icon="i-heroicons-link"
      color="purple"
    />
  </div>
</template>

<script setup lang="ts">
interface Node {
  id: string
  name: string
  type: 'router' | 'switch' | 'isp'
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
}

const props = defineProps<Props>()

const routerCount = computed(() => 
  props.nodes.filter(n => n.type === 'router').length
)

const switchCount = computed(() => 
  props.nodes.filter(n => n.type === 'switch').length
)

const ispCount = computed(() => 
  props.nodes.filter(n => n.type === 'isp').length
)
</script>
