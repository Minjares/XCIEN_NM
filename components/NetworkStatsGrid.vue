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
import type { Node, Link } from '~/types/network'

interface Props {
  nodes: Node[]
  links: Link[]
}

const props = defineProps<Props>()

const routerCount = computed(() =>
  props.nodes.filter((n: Node) => n.type === 'router').length
)

const switchCount = computed(() =>
  props.nodes.filter((n: Node) => n.type === 'switch').length
)

const ispCount = computed(() =>
  props.nodes.filter((n: Node) => n.type === 'isp').length
)
</script>
