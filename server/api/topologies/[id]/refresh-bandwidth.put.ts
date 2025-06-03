import { useDrizzle, tables, eq } from '~/server/utils/useDrizzle'

export default defineEventHandler(async (event) => {
  try {
    const topologyId = getRouterParam(event, 'id')
    
    if (!topologyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Topology ID is required'
      })
    }

    const db = useDrizzle()

    // External API configuration
    const API_BASE_URL = 'http://201.150.5.213/api/v0/ports'
    const API_CREDENTIALS = {
      username: 'grupo5',
      password: '99zAL@wW'
    }

    console.log(`Starting bandwidth refresh for topology: ${topologyId}`)

    // Get all links for this topology with their port information
    const linksWithPorts = await db.select({
      linkId: tables.links.id,
      sourceId: tables.links.sourceId,
      targetId: tables.links.targetId,
      currentBandwidth: tables.links.currentBandwidth
    })
    .from(tables.links)
    .innerJoin(tables.ports, eq(tables.links.sourceId, tables.ports.id))
    .innerJoin(tables.nodes, eq(tables.ports.deviceId, tables.nodes.id))
    .where(eq(tables.nodes.topologyId, topologyId))

    console.log(`Found ${linksWithPorts.length} links to process`)

    // Helper function to check if port ID is numeric
    const isNumericPortId = (portId: string): boolean => {
      return /^\d+$/.test(portId)
    }

    // Helper function to fetch bandwidth from external API
    const fetchPortBandwidth = async (portId: string): Promise<number | null> => {
      try {
        const authString = `${API_CREDENTIALS.username}:${API_CREDENTIALS.password}`
        const authHeader = `Basic ${btoa(authString)}`

        const response: any = await $fetch(`${API_BASE_URL}/${portId}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        })

        if (response?.port) {
          const { in_rate, out_rate } = response.port
          // Convert from bits to Mbps and return max of in_rate and out_rate
          return Math.max(in_rate || 0, out_rate || 0) / 1000000
        }

        return null
      } catch (error) {
        console.error(`Error fetching bandwidth for port ${portId}:`, error)
        return null
      }
    }

    // Process links and update bandwidth
    const updates: Array<{ linkId: string; bandwidth: number }> = []
    const errors: string[] = []
    let processed = 0

    for (const link of linksWithPorts) {
      processed++
      console.log(`Processing link ${processed}/${linksWithPorts.length}: ${link.linkId}`)

      // Try source port first, then target port
      let bandwidth: number | null = null
      let usedPortId: string | null = null

      // Check source port
      if (isNumericPortId(link.sourceId)) {
        bandwidth = await fetchPortBandwidth(link.sourceId)
        usedPortId = link.sourceId
      }
      
      // If source failed or wasn't numeric, try target
      if (bandwidth === null && isNumericPortId(link.targetId)) {
        bandwidth = await fetchPortBandwidth(link.targetId)
        usedPortId = link.targetId
      }

      if (bandwidth !== null && usedPortId) {
        updates.push({ linkId: link.linkId, bandwidth })
        console.log(`Link ${link.linkId}: Updated bandwidth to ${bandwidth} Mbps (from port ${usedPortId})`)
      } else {
        const error = `Link ${link.linkId}: No numeric ports or failed to fetch bandwidth`
        errors.push(error)
        console.warn(error)
      }

      // Add small delay to avoid overwhelming the external API
      if (processed % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Update database with new bandwidth values
    console.log(`Updating ${updates.length} links in database...`)
    
    for (const update of updates) {
      await db.update(tables.links)
        .set({ currentBandwidth: Math.round(update.bandwidth) })
        .where(eq(tables.links.id, update.linkId))
    }

    console.log(`Bandwidth refresh completed for topology ${topologyId}`)

    return {
      success: true,
      data: {
        topologyId,
        totalLinks: linksWithPorts.length,
        updatedLinks: updates.length,
        errors: errors.length,
        errorDetails: errors
      }
    }

  } catch (error: any) {
    console.error('Error during bandwidth refresh:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to refresh bandwidth: ${error.message || 'Unknown error'}`
    })
  }
})
