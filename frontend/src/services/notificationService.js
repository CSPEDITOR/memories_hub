import api from './api.js'

export async function fetchNotifications() {
  const { data } = await api.get('/api/notifications')
  return data
}

export async function fetchUnreadCount() {
  const { data } = await api.get('/api/notifications/unread-count')
  return data
}

export async function markAllRead() {
  await api.patch('/api/notifications/read-all')
}
