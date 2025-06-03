import type { Link } from '~/types/network'

export const useNetworkBandwidthRefresh = () => {
  
  const isRefreshingBandwidth = ref(false)
  const refreshProgress = ref(0)
  const refreshErrors = ref<string[]>([])

  // Usamos un proxy del servidor para evitar problemas de CORS
  const BANDWIDTH_API_BASE = '/api/bandwidth'

  /**
   * Verifica si un ID de puerto es puramente numérico
   */
  const isNumericPortId = (portId: string): boolean => {
    return /^\d+$/.test(portId)
  }

  /**
   * Extrae UN solo ID de puerto numérico de un enlace (prioriza el origen, y si no, usa el destino)
   * Esto minimiza las llamadas a la API al verificar solo un puerto por enlace
   */
  const extractSingleNumericPortId = (link: Link): string | null => {
    // Extrae primero el ID del puerto de origen
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source
    if (isNumericPortId(sourceId)) {
      return sourceId
    }

    // Si el origen no es numérico, intenta con el destino
    const targetId = typeof link.target === 'object' ? link.target.id : link.target
    if (isNumericPortId(targetId)) {
      return targetId
    }

    return null
  }

  /**
   * Obtiene los datos de ancho de banda para un puerto específico desde la API externa
   */
  const fetchPortBandwidth = async (portId: string): Promise<number | null> => {
    try {
      console.log(`Obteniendo ancho de banda para el puerto ${portId} vía proxy del servidor`)

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
        console.log(`Puerto ${portId} ancho de banda: in_rate=${in_rate}, out_rate=${out_rate}, currentBandwidth=${currentBandwidth}`)
        return currentBandwidth
      }

      return null
    } catch (error: any) {
      console.error(`Error al obtener el ancho de banda del puerto ${portId}:`, error)
      console.error(`Detalles del error:`, {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        data: error?.data
      })

      let errorMessage = 'Error desconocido'
      if (error?.status === 401) {
        errorMessage = 'No autorizado'
      } else if (error?.status === 404) {
        errorMessage = 'Puerto no encontrado'
      } else if (error?.status === 400) {
        errorMessage = 'ID de puerto inválido'
      } else if (error?.message) {
        errorMessage = error.message
      }

      refreshErrors.value.push(`Puerto ${portId}: ${errorMessage}`)
      return null
    }
  }

  /**
   * Actualiza los datos de ancho de banda para todos los enlaces en la topología
   */
  const refreshLinksBandwidth = async (links: Ref<Link[]>): Promise<void> => {
    if (isRefreshingBandwidth.value) {
      console.log('Ya hay una actualización de ancho de banda en curso')
      return
    }

    try {
      isRefreshingBandwidth.value = true
      refreshProgress.value = 0
      refreshErrors.value = []

      console.log('Iniciando proceso de actualización de ancho de banda...')
      console.log('Total de enlaces a procesar:', links.value.length)

      // Recolecta todos los IDs de puerto numéricos únicos (uno por enlace)
      const portIdsToUpdate = new Set<string>()
      const linkPortMapping = new Map<string, string>() // linkId -> portId (un solo puerto)

      links.value.forEach(link => {
        const numericPortId = extractSingleNumericPortId(link)
        console.log(`Enlace ${link.id}: ID de puerto numérico encontrado:`, numericPortId)
        if (numericPortId) {
          linkPortMapping.set(link.id, numericPortId)
          portIdsToUpdate.add(numericPortId)
        }
      })

      if (portIdsToUpdate.size === 0) {
        console.log('No se encontraron IDs de puerto numéricos en los enlaces')
        console.log('Todos los enlaces:', links.value.map(l => ({
          id: l.id,
          source: typeof l.source === 'object' ? l.source.id : l.source,
          target: typeof l.target === 'object' ? l.target.id : l.target
        })))

        // Para pruebas, intentamos con un ID de puerto conocido
        console.log('Probando con el puerto 12497...')
        const testBandwidth = await fetchPortBandwidth('12497')
        console.log('Resultado de prueba:', testBandwidth)

        return
      }

      console.log(`Iniciando actualización de ancho de banda para ${portIdsToUpdate.size} puertos únicos:`, Array.from(portIdsToUpdate))

      // Obtener datos de ancho de banda en paralelo (con límite de concurrencia)
      const portBandwidthData = new Map<string, number>()
      const portIds = Array.from(portIdsToUpdate)
      const batchSize = 5 // Procesar 5 puertos a la vez para no saturar la API
      
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
        
        // Actualiza el progreso
        refreshProgress.value = Math.round(((i + batch.length) / portIds.length) * 100)
      }

      // Actualiza el campo `currentBandwidth` de cada enlace
      let updatedLinksCount = 0

      links.value.forEach(link => {
        const linkPortId = linkPortMapping.get(link.id)
        if (linkPortId) {
          // Obtiene el ancho de banda correspondiente al puerto de este enlace
          const bandwidth = portBandwidthData.get(linkPortId)

          if (bandwidth !== undefined) {
            link.currentBandwidth = bandwidth
            updatedLinksCount++
            console.log(`Enlace ${link.id} actualizado con ancho de banda ${bandwidth} del puerto ${linkPortId}`)
          }
        }
      })

      console.log(`Actualización de ancho de banda completada. ${updatedLinksCount} enlaces actualizados.`)
      
      if (refreshErrors.value.length > 0) {
        console.warn(`Actualización completada con ${refreshErrors.value.length} errores:`, refreshErrors.value)
      }

    } catch (error) {
      console.error('Error durante la actualización de ancho de banda:', error)
      refreshErrors.value.push('Error general durante la actualización de ancho de banda')
    } finally {
      isRefreshingBandwidth.value = false
      refreshProgress.value = 100
      
      // Limpia el progreso después de un pequeño retraso
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
