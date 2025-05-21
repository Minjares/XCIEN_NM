<template>
  <div class="space-y-4">
    <UFormGroup label="Dispositivo de Origen" required>
      <USelect
        v-model="sourceId"
        :options="formattedNodeOptions"
        placeholder="Seleccionar dispositivo de origen"
        class="w-full"
        size="lg"
      />
    </UFormGroup>
    
    <UFormGroup label="Dispositivo de Destino" required>
      <USelect
        v-model="targetId"
        :options="formattedNodeOptions"
        placeholder="Seleccionar dispositivo de destino"
        class="w-full"
        size="lg"
      />
    </UFormGroup>
    
    <UButton
      block
      color="primary"
      @click="createConnection"
      :disabled="!isFormValid"
      icon="i-heroicons-link"
      size="lg"
      :ui="{ rounded: 'rounded-lg' }"
    >
      Conectar Dispositivos
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Node, Link } from '~/types/network';

// Get translations
const { t } = useTranslation();

// Define props
const props = defineProps<{
  nodes: Node[];
}>();

// Define emits
const emit = defineEmits<{
  'connection-created': [link: Link];
}>();

// Form state
const sourceId = ref('');
const targetId = ref('');

// Generate a unique ID for links
const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Format nodes for select dropdown
const nodeOptions = computed(() => {
  return props.nodes.map(node => ({
    label: `${node.name} (${node.type})`,
    value: node.id,
    type: node.type
  }));
});

// Format nodes with icons for display
const formattedNodeOptions = computed(() => {
  return props.nodes.map(node => {
    const icon = node.type === 'router' ? '🔵 ' : '🟢 ';
    return {
      label: `${icon}${node.name} (${node.type === 'router' ? 'Router' : 'Switch'})`,
      value: node.id
    };
  });
});

// Check if the form is valid
const isFormValid = computed(() => {
  return sourceId.value &&
         targetId.value &&
         sourceId.value !== targetId.value;
});

// Create a connection between nodes
const createConnection = () => {
  if (!isFormValid.value) return;

  const link: Link = {
    id: generateId(),
    source: sourceId.value,
    target: targetId.value
  };

  emit('connection-created', link);

  // Reset form
  sourceId.value = '';
  targetId.value = '';
};
</script>
