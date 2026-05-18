import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'
import { fadeUp } from '@/animations/variants.js'

export function RegisterPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passoutYear: '',
    department: '',
  })
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await register({
        ...form,
        passoutYear: form.passoutYear ? Number(form.passoutYear) : undefined,
      })
      nav('/', { replace: true })
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <>
      <Helmet>
        <title>Register — IGIT Memories</title>
      </Helmet>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-lg mx-auto glass rounded-3xl p-8 space-y-6">
        <div>
          <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Join the yearbook</h1>
          <p className="text-sm text-stone-500 mt-2">
            For IGIT students only. Set <code className="text-xs">STUDENT_EMAIL_DOMAIN</code> on the server to restrict
            signups to your college domain.
          </p>
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}
        <form className="space-y-4 grid sm:grid-cols-2 gap-4" onSubmit={submit}>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-gold-dim">Full name</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-gold-dim">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-gold-dim">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gold-dim">Passout year</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={form.passoutYear}
              onChange={(e) => setForm({ ...form, passoutYear: e.target.value })}
              type="number"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gold-dim">Department</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </div>
          <button type="submit" className="sm:col-span-2 w-full py-3 rounded-xl bg-gradient-to-r from-gold to-ember text-night font-semibold shadow-glow">
            Create account
          </button>
        </form>
        <p className="text-sm text-center text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="text-gold underline-offset-4 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </>
  )
}
