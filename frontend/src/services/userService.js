import api from './api.js'

export async function fetchProfile(id) {
  const { data } = await api.get(`/api/users/${id}`)
  return data
}

export async function updateProfile(formData) {
  const { data } = await api.patch('/api/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function followUser(id) {
  const { data } = await api.post(`/api/users/${id}/follow`)
  return data
}

export async function fetchSaved() {
  const { data } = await api.get('/api/users/me/saved')
  return data
}

export async function fetchGallery(userId) {
  const { data } = await api.get(`/api/users/${userId}/gallery`)
  return data
}
