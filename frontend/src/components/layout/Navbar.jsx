import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Camera,
  CalendarHeart,
  Home,
  Image as ImageIcon,
  LogOut,
  Search,
  Sparkles,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext.jsx'
import { ThemeToggle } from '@/components/ui/ThemeToggle.jsx'
import { useUnreadNotifications } from '@/context/SocketContext.jsx'

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
    ? 'bg-gold/20 text-stone-900 dark:text-parchment shadow-glow'
    : 'text-stone-600 dark:text-stone-300 hover:bg-white/10'
  }`

function NavBarLinks({ user, unread, onNavigate }) {
  return (
    <>
      <NavLink to="/" className={linkClass} onClick={onNavigate}>
        <Home className="w-4 h-4" /> Dashboard
      </NavLink>
      <NavLink to="/events" className={linkClass} onClick={onNavigate}>
        <CalendarHeart className="w-4 h-4" /> Events
      </NavLink>
      <NavLink to="/story-of-the-day" className={linkClass} onClick={onNavigate}>
        <Sparkles className="w-4 h-4" /> Story of the Day
      </NavLink>
      <NavLink to="/memories" className={linkClass} onClick={onNavigate}>
        <ImageIcon className="w-4 h-4" /> Memories
      </NavLink>
      <NavLink to="/upload" className={linkClass} onClick={onNavigate}>
        <Camera className="w-4 h-4" /> Upload
      </NavLink>
      <NavLink to={user ? `/profile/${user._id || user.id}` : '/login'} className={linkClass} onClick={onNavigate}>
        <User className="w-4 h-4" /> Profile
      </NavLink>
      <NavLink to="/search" className={linkClass} onClick={onNavigate}>
        <Search className="w-4 h-4" /> Search
      </NavLink>
      <NavLink to="/notifications" className={linkClass} onClick={onNavigate}>
        <span className="relative">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full bg-ember text-white flex items-center justify-center font-semibold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
        Notifications
      </NavLink>
    </>
  )
}

export function Navbar() {
  const { user, logout, isAuthenticated, token } = useAuth()
  const nav = useNavigate()
  const unread = useUnreadNotifications(Boolean(token))
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    nav('/login')
    setOpen(false)
  }

  const closeMenu = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 dark:border-white/5 backdrop-blur-2xl bg-parchment/80 dark:bg-night/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-ember shadow-glow"
            whileHover={{ scale: 1.06, rotate: 6 }}
          />
          <div>
            <p className="font-display text-xl leading-none text-stone-900 dark:text-parchment tracking-tight">
              IGIT Memories
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-dim">Sarang · Yearbook of the heart</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <NavBarLinks user={user} unread={unread} onNavigate={closeMenu} />
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex text-sm font-medium px-3 py-2 rounded-xl bg-gold/20 text-stone-900 dark:text-parchment">
              Login
            </Link>
          )}
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl glass"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-white/10 dark:border-white/5 bg-parchment/95 dark:bg-night/95"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              <NavBarLinks user={user} unread={unread} onNavigate={closeMenu} />
              {isAuthenticated ? (
                <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left hover:bg-white/10">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <Link to="/login" className="px-3 py-2 rounded-xl text-sm bg-gold/20" onClick={closeMenu}>
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
