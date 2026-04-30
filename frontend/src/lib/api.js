import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

export async function healthCheck() {
  const { data } = await client.get('/api/health')
  return data
}

export async function submitLead(payload) {
  const { data } = await client.post('/api/leads/score', payload)
  return data
}

export async function fetchLead(id) {
  const { data } = await client.get(`/api/leads/${id}`)
  return data
}

export async function listLeads(limit = 50, offset = 0) {
  const { data } = await client.get('/api/leads', { params: { limit, offset } })
  return data
}
