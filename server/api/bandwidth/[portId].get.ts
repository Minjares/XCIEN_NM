export default defineEventHandler(async (event) => {
  try {
    const portId = getRouterParam(event, 'portId')
    
    if (!portId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Port ID is required'
      })
    }

    // Check if port ID is numeric
    if (!/^\d+$/.test(portId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Port ID must be numeric'
      })
    }

    // External API configuration
    const API_BASE_URL = 'http://201.150.5.213/api/v0/ports'
    const API_CREDENTIALS = {
      username: 'grupo5',
      password: '99zAL@wW'
    }

    // Create Basic Auth header
    const authString = `${API_CREDENTIALS.username}:${API_CREDENTIALS.password}`
    const authHeader = `Basic ${btoa(authString)}`

    // Make request to external API
    const response:any = await $fetch(`${API_BASE_URL}/${portId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    })


    // Extract bandwidth data
    if (response?.port) {
      const { in_rate, out_rate } = response.port
      const currentBandwidth = (Math.max(in_rate || 0, out_rate || 0))/1000
      
      return {
        success: true,
        data: {
          portId,
          in_rate: in_rate || 0,
          out_rate: out_rate || 0,
          currentBandwidth
        }
      }
    }

    throw createError({
      statusCode: 404,
      statusMessage: 'Port data not found'
    })

  } catch (error: any) {
    console.error(`Error fetching bandwidth for port:`, error)
    
    // Handle different types of errors
    if (error.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid credentials'
      })
    }
    
    if (error.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Port not found'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch bandwidth data: ${error.message || 'Unknown error'}`
    })
  }
})
