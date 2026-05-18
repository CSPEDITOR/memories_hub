import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar.jsx'
import { ParticlesBg } from '@/components/ui/ParticlesBg.jsx'
import { pageTransition } from '@/animations/variants.js'

export function AppLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen film-grain relative">
      <ParticlesBg />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
