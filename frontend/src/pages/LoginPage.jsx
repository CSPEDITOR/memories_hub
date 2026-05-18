import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'
import { fadeUp } from '@/animations/variants.js'

export function LoginPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await login({ email, password })
      nav(loc.state?.from || '/', { replace: true })
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Login failed')
    }
  }

  return (
    <>
      <Helmet>
        <title>Login — IGIT Memories</title>
      </Helmet>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-md mx-auto glass rounded-3xl p-8 space-y-6">
        <div>
          <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Welcome back</h1>
          <p className="text-sm text-stone-500 mt-2">Sign in with your IGIT student email.</p>
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="text-xs uppercase tracking-widest text-gold-dim">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gold-dim">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-ember text-night font-semibold shadow-glow">
            Continue
          </button>
        </form>
        <p className="text-sm text-center text-stone-500">
          New here?{' '}
          <Link to="/register" className="text-gold underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </>
  )
}
