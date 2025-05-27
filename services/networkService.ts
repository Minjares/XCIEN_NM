import  { NetworkGraph } from '~/types/network';
import type { Link }  from '~/types/network';
// API endpoints
const API_BASE_URL = '/api'; // Adjust based on your API setup
const BANDWIDTH_ENDPOINT = `${API_BASE_URL}/bandwidth`;

export async function fetchNetworkBandwidth(): Promise<{linkId: string, currentBandwidth: number}[]> {
  try {
    const response = await fetch(BANDWIDTH_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch bandwidth data:', error);
    return [];
  }
}

export async function updateNetworkBandwidth(graph: NetworkGraph): Promise<NetworkGraph> {
  const bandwidthData = await fetchNetworkBandwidth();
  
  // Update each link with the latest bandwidth data
  bandwidthData.forEach(data => {
    const link = graph.getLink(data.linkId);
    if (link) {
      link.currentBandwidth = data.currentBandwidth;
      graph.addLink(link); // Update the link in the graph
    }
  });
  
  return graph;
}

// For polling/real-time updates
export function startBandwidthMonitoring(
  graph: NetworkGraph, 
  onUpdate: (graph: NetworkGraph) => void,
  interval = 30000 // Default 30 seconds
): () => void {
  const timerId = setInterval(async () => {
    const updatedGraph = await updateNetworkBandwidth(graph);
    onUpdate(updatedGraph);
  }, interval);
  
  // Return a function to stop monitoring
  return () => clearInterval(timerId);
}