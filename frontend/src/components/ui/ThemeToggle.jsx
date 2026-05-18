import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext.jsx'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-full glass hover:scale-105 transition-transform"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-gold-dim" />}
    </button>
  )
}
