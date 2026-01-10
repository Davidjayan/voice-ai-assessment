import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, gql } from '@apollo/client'
import { Button } from '../components/ui'
import { Input } from '../components/forms'
import { useAuth } from '../hooks/useAuth'

const JOIN_ORGANIZATION = gql`
  mutation JoinOrganization($inviteCode: String!) {
    joinOrganization(inviteCode: $inviteCode) {
      success
      error
      organization {
        id
        name
      }
    }
  }
`

export default function JoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  const [joinOrganization, { loading }] = useMutation(JOIN_ORGANIZATION)

  const handleJoin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    setSuccess(null)

    if (!code.trim()) {
      setError('Invite code is required')
      return
    }

    try {
      const { data } = await joinOrganization({
        variables: { inviteCode: code.trim() }
      })

      if (data?.joinOrganization?.success) {
        setSuccess(`Successfully joined ${data.joinOrganization.organization.name}!`)
        setTimeout(() => navigate('/'), 2000)
      } else {
        setError(data?.joinOrganization?.error || 'Failed to join organization')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  // Auto-join if code is present in URL and user is authenticated
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode && isAuthenticated) {
      setCode(urlCode)
      // Small delay to ensure the mutation is ready
      setTimeout(() => {
        joinOrganization({ variables: { inviteCode: urlCode } })
          .then(({ data }) => {
            if (data?.joinOrganization?.success) {
              setSuccess(`Successfully joined ${data.joinOrganization.organization.name}!`)
              setTimeout(() => navigate('/'), 2000)
            } else {
              setError(data?.joinOrganization?.error || 'Failed to join organization')
            }
          })
          .catch(() => setError('An error occurred'))
      }, 100)
    }
  }, [searchParams, isAuthenticated])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <div className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Join Organization</h1>
          <p className="text-slate-600 dark:text-slate-400">Enter your invite code to join</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-400 mb-2">{success}</p>
            <p className="text-sm text-slate-400">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-6">
            <Input
              label="Invite Code"
              placeholder="Enter your invite code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Join Organization'}
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Don't have an account?{' '}
                <a href="/login" className="text-primary-500 hover:text-primary-400">
                  Sign up first
                </a>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
