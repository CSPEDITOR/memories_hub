import api from './api.js'

export async function fetchComments(memoryId) {
  const { data } = await api.get(`/api/memories/${memoryId}/comments`)
  return data
}

export async function postComment(memoryId, text) {
  const { data } = await api.post(`/api/memories/${memoryId}/comments`, { text })
  return data
}
