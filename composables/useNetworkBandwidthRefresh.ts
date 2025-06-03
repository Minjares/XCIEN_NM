import type { Link } from '~/types/network'

export const useNetworkBandwidthRefresh = () => {
  
  const isRefreshingBandwidth = ref(false)
  const refreshProgress = ref(0)
  const refreshErrors = ref<string[]>([])

  // Use our server-side proxy to avoid CORS issues
  const BANDWIDTH_API_BASE = '/api/bandwidth'

  /**
   * Check if a port ID is purely numeric
   */
  const isNumericPortId = (portId: string): boolean => {
    return /^\d+$/.test(portId)
  }

  /**
   * Extract ONE numeric port ID from a link (prioritize source, fallback to target)
   * This minimizes API calls by only checking one port per link
   */
  const extractSingleNumericPortId = (link: Link): string | null => {
    // Extract source port ID first
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source
    if (isNumericPortId(sourceId)) {
      return sourceId
    }

    // Fallback to target port ID if source is not numeric
    const targetId = typeof link.target === 'object' ? link.target.id : link.target
    if (isNumericPortId(targetId)) {
      return targetId
    }

    return null
  }

  /**
   * Fetch bandwidth data for a specific port from the external API
   */
  const fetchPortBandwidth = async (portId: string): Promise<number | null> => {
    try {
      console.log(`Fetching bandwidth for port ${portId} via server proxy`)

      const response = await $fetch<{
        success: boolean;
        data: {
          portId: string;
          in_rate: number;
          out_rate: number;
          currentBandwidth: number;
        }
      }>(`${BANDWIDTH_API_BASE}/${portId}`, {
        method: 'GET',
      })


      if (response?.success && response?.data) {
        const { in_rate, out_rate, currentBandwidth } = response.data
        console.log(`Port ${portId} bandwidth: in_rate=${in_rate}, out_rate=${out_rate}, currentBandwidth=${currentBandwidth}`)
        return currentBandwidth
      }

      return null
    } catch (error: any) {
      console.error(`Error fetching bandwidth for port ${portId}:`, error)
      console.error(`Error details:`, {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        data: error?.data
      })

      let errorMessage = 'Unknown error'
      if (error?.status === 401) {
        errorMessage = 'Unauthorized'
      } else if (error?.status === 404) {
        errorMessage = 'Port not found'
      } else if (error?.status === 400) {
        errorMessage = 'Invalid port ID'
      } else if (error?.message) {
        errorMessage = error.message
      }

      refreshErrors.value.push(`Port ${portId}: ${errorMessage}`)
      return null
    }
  }

  /**
   * Update bandwidth data for all links in the topology
   */
  const refreshLinksBandwidth = async (links: Ref<Link[]>): Promise<void> => {
    if (isRefreshingBandwidth.value) {
      console.log('Bandwidth refresh already in progress')
      return
    }

    try {
      isRefreshingBandwidth.value = true
      refreshProgress.value = 0
      refreshErrors.value = []

      console.log('Starting bandwidth refresh process...')
      console.log('Total links to process:', links.value.length)

      // Collect all unique numeric port IDs from all links (one per link)
      const portIdsToUpdate = new Set<string>()
      const linkPortMapping = new Map<string, string>() // linkId -> portId (single port)

      links.value.forEach(link => {
        const numericPortId = extractSingleNumericPortId(link)
        console.log(`Link ${link.id}: found numeric port ID:`, numericPortId)
        if (numericPortId) {
          linkPortMapping.set(link.id, numericPortId)
          portIdsToUpdate.add(numericPortId)
        }
      })

      if (portIdsToUpdate.size === 0) {
        console.log('No numeric port IDs found in links')
        console.log('All links:', links.value.map(l => ({
          id: l.id,
          source: typeof l.source === 'object' ? l.source.id : l.source,
          target: typeof l.target === 'object' ? l.target.id : l.target
        })))

        // For testing purposes, let's try with a known numeric port ID
        console.log('Testing with known port ID 12497...')
        const testBandwidth = await fetchPortBandwidth('12497')
        console.log('Test result:', testBandwidth)

        return
      }

      console.log(`Starting bandwidth refresh for ${portIdsToUpdate.size} unique ports:`, Array.from(portIdsToUpdate))

      // Fetch bandwidth data for all ports in parallel (with concurrency limit)
      const portBandwidthData = new Map<string, number>()
      const portIds = Array.from(portIdsToUpdate)
      const batchSize = 5 // Process 5 ports at a time to avoid overwhelming the API
      
      for (let i = 0; i < portIds.length; i += batchSize) {
        const batch = portIds.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (portId) => {
          const bandwidth = await fetchPortBandwidth(portId)
          if (bandwidth !== null) {
            portBandwidthData.set(portId, bandwidth)
          }
          return { portId, bandwidth }
        })

        await Promise.all(batchPromises)
        
        // Update progress
        refreshProgress.value = Math.round(((i + batch.length) / portIds.length) * 100)
      }

      // Update currentBandwidth for each link based on the fetched data
      let updatedLinksCount = 0

      links.value.forEach(link => {
        const linkPortId = linkPortMapping.get(link.id)
        if (linkPortId) {
          // Get bandwidth value for the single port representing this link
          const bandwidth = portBandwidthData.get(linkPortId)

          if (bandwidth !== undefined) {
            link.currentBandwidth = bandwidth
            updatedLinksCount++
            console.log(`Updated link ${link.id} with bandwidth ${bandwidth} from port ${linkPortId}`)
          }
        }
      })

      console.log(`Bandwidth refresh completed. Updated ${updatedLinksCount} links.`)
      
      if (refreshErrors.value.length > 0) {
        console.warn(`Bandwidth refresh completed with ${refreshErrors.value.length} errors:`, refreshErrors.value)
      }

    } catch (error) {
      console.error('Error during bandwidth refresh:', error)
      refreshErrors.value.push('General error during bandwidth refresh')
    } finally {
      isRefreshingBandwidth.value = false
      refreshProgress.value = 100
      
      // Clear progress after a short delay
      setTimeout(() => {
        refreshProgress.value = 0
      }, 2000)
    }
  }

  return {
    isRefreshingBandwidth: readonly(isRefreshingBandwidth),
    refreshProgress: readonly(refreshProgress),
    refreshErrors: readonly(refreshErrors),
    refreshLinksBandwidth
  }
}
