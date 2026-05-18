import api from './api.js'

export async function fetchCategories() {
  const { data } = await api.get('/api/events/categories')
  return data
}

export async function fetchNostalgicQuote() {
  const { data } = await api.get('/api/quotes/nostalgic')
  return data
}

export async function searchAll(q) {
  const { data } = await api.get('/api/search', { params: { q } })
  return data
}
