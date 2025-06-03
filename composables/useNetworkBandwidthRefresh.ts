export const useNetworkBandwidthRefresh = () => {
  const isRefreshingBandwidth = ref(false)
  const refreshProgress = ref(0)
  const refreshErrors = ref<string[]>([])


  const refreshTopologyBandwidth = async (topologyId: string): Promise<void> => {
    if (isRefreshingBandwidth.value) {
      console.log('Bandwidth refresh already in progress')
      return
    }

    try {
      isRefreshingBandwidth.value = true
      refreshProgress.value = 0
      refreshErrors.value = []

      console.log(`Starting bandwidth refresh for topology: ${topologyId}`)

      const response = await $fetch<{
        success: boolean;
        data: {
          topologyId: string;
          totalLinks: number;
          updatedLinks: number;
          errors: number;
          errorDetails: string[];
        }
      }>(`/api/topologies/${topologyId}/refresh-bandwidth`, {
        method: 'PUT',
        timeout: 60000 // 60 second timeout for the entire operation
      })

      if (response?.success && response?.data) {
        const { totalLinks, updatedLinks, errors, errorDetails } = response.data

        console.log(`Bandwidth refresh completed:`)
        console.log(`- Total links: ${totalLinks}`)
        console.log(`- Updated links: ${updatedLinks}`)
        console.log(`- Errors: ${errors}`)

        if (errorDetails.length > 0) {
          refreshErrors.value = errorDetails
          console.warn('Errors during refresh:', errorDetails)
        }

        refreshProgress.value = 100
      } else {
        throw new Error('Invalid response from server')
      }

    } catch (error: any) {
      console.error('Error during bandwidth refresh:', error)

      let errorMessage = 'Unknown error'
      if (error?.status === 400) {
        errorMessage = 'Invalid topology ID'
      } else if (error?.status === 404) {
        errorMessage = 'Topology not found'
      } else if (error?.status === 500) {
        errorMessage = 'Server error during refresh'
      } else if (error?.message) {
        errorMessage = error.message
      }

      refreshErrors.value = [errorMessage]
    } finally {
      isRefreshingBandwidth.value = false

   
      setTimeout(() => {
        refreshProgress.value = 0
      }, 2000)
    }
  }

  return {
    isRefreshingBandwidth: readonly(isRefreshingBandwidth),
    refreshProgress: readonly(refreshProgress),
    refreshErrors: readonly(refreshErrors),
    refreshTopologyBandwidth
  }
}
