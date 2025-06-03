import { useDrizzle, tables, eq } from '~/server/utils/useDrizzle'

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle()
    const topologyId = getRouterParam(event, 'id')
    
    if (!topologyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Se requiere la topologia'
      })
    }

    // Conseguimos los datos de la topologia
    const topology = await db.select().from(tables.topologies).where(eq(tables.topologies.id, topologyId)).limit(1)
    
    if (topology.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontro la topologia'
      })
    }

    // Conseguimos los nodos con los puertos
    const nodesWithPorts = await db.select({
      nodeId: tables.nodes.id,
      nodeName: tables.nodes.name,
      nodeType: tables.nodes.type,
      nodeX: tables.nodes.x,
      nodeY: tables.nodes.y,
      portId: tables.ports.id,
      portName: tables.ports.name,
      portStatus: tables.ports.status,
      portDeviceId: tables.ports.deviceId
    })
    .from(tables.nodes)
    .leftJoin(tables.ports, eq(tables.nodes.id, tables.ports.deviceId))
    .where(eq(tables.nodes.topologyId, topologyId))

    // Conseguimos los links entre los puertos
    const links = await db.select().from(tables.links)
    .innerJoin(tables.ports, eq(tables.links.sourceId, tables.ports.id))
    .innerJoin(tables.nodes, eq(tables.ports.deviceId, tables.nodes.id))
    .where(eq(tables.nodes.topologyId, topologyId))

    
    const nodesMap = new Map()
    
    // Transformamos los datos
    nodesWithPorts.forEach(row => {
      if (!nodesMap.has(row.nodeId)) {
        nodesMap.set(row.nodeId, {
          id: row.nodeId,
          name: row.nodeName,
          type: row.nodeType,
          x: row.nodeX,
          y: row.nodeY,
          Ports: []
        })
      }
      
      if (row.portId) {
        nodesMap.get(row.nodeId).Ports.push({
          id: row.portId,
          name: row.portName,
          status: row.portStatus,
          deviceId: row.portDeviceId
        })
      }
    })

    const nodes = Array.from(nodesMap.values())

    // Transformamos los valores de los nodos
    const transformedLinks = links.map(link => ({
      id: link.links.id,
      source: link.links.sourceId,
      target: link.links.targetId,
      type: link.links.type,
      maxBandwidth: link.links.maxBandwidth,
      currentBandwidth: link.links.currentBandwidth,
      value: link.links.value || 1
    }))

    return {
      success: true,
      data: {
        topology: topology[0],
        nodes,
        links: transformedLinks
      }
    }
  } catch (error) {
    console.error('Error consiguiendo los datos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error consiguiendo los datos'
    })
  }
})
