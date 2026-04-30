import { useQuery } from '@tanstack/react-query'
import { fetchLead } from './api'

const POLL_INTERVAL = 1500
const MAX_POLLS = 20 // ~30 seconds

export function usePollLead(id) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return POLL_INTERVAL
      if (data.status === 'pending') {
        const pollCount = query.state.fetchFailureCount + (query.state.dataUpdateCount ?? 0)
        return pollCount >= MAX_POLLS ? false : POLL_INTERVAL
      }
      return false
    },
    refetchIntervalInBackground: false,
  })
}
