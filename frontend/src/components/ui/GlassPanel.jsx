import { motion } from 'framer-motion'

/** Soft glass panel used across the app */
export function GlassPanel({ className = '', children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
