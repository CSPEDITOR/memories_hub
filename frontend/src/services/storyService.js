import api from './api.js'

export async function fetchStories() {
  const { data } = await api.get('/api/stories')
  return data
}

export async function postStory(formData) {
  const { data } = await api.post('/api/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function viewStory(id) {
  await api.post(`/api/stories/${id}/view`)
}
