import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button } from '../components/ui'
import { Input } from '../components/forms'
import { useAuth, LOGIN_MUTATION } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const { data } = await loginMutation({
        variables: { username, password },
      })

      if (data?.login?.success) {
        await login()
      } else {
        setError(data?.login?.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred during login')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <div className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to manage your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
