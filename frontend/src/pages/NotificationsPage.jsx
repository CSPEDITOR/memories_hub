import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import * as notificationService from '@/services/notificationService.js'
import { formatRelative } from '@/utils/formatDate.js'
import { Link } from 'react-router-dom'
import { fadeUp } from '@/animations/variants.js'

export function NotificationsPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    notificationService.fetchNotifications().then(setItems).catch(() => setItems([]))
    notificationService.markAllRead().catch(() => {})
  }, [])

  return (
    <>
      <Helmet>
        <title>Notifications — IGIT Memories</title>
      </Helmet>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-xl mx-auto space-y-4">
        <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Notifications</h1>
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n._id} className="glass rounded-2xl p-4 text-sm">
              <p className="text-stone-900 dark:text-parchment">{n.message}</p>
              <p className="text-xs text-stone-500 mt-1">{formatRelative(n.createdAt)}</p>
              {n.memory && (
                <Link to="/memories" className="text-gold text-xs mt-2 inline-block">
                  Open memory
                </Link>
              )}
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  )
}
