import api from './api.js'

export async function fetchMemories(params) {
  const { data } = await api.get('/api/memories', { params })
  return data
}

export async function fetchMemory(id) {
  const { data } = await api.get(`/api/memories/${id}`)
  return data
}

export async function fetchTrending() {
  const { data } = await api.get('/api/memories/trending')
  return data
}

export async function fetchRandomMemories() {
  const { data } = await api.get('/api/memories/random')
  return data
}

export async function fetchRelated(id) {
  const { data } = await api.get(`/api/memories/${id}/related`)
  return data
}

export async function createMemory(formData) {
  const { data } = await api.post('/api/memories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function likeMemory(id) {
  const { data } = await api.post(`/api/memories/${id}/like`)
  return data
}

export async function saveMemory(id) {
  const { data } = await api.post(`/api/memories/${id}/save`)
  return data
}

export async function bumpView(id) {
  const { data } = await api.post(`/api/memories/${id}/view`)
  return data
}
