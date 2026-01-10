import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/Dialog'
import { Button } from './ui'
import { Input } from './forms'

const INVITE_TO_ORGANIZATION = gql`
  mutation InviteToOrganization($organizationId: UUID!, $email: String!) {
    inviteToOrganization(organizationId: $organizationId, email: $email) {
      success
      error
      inviteCode
    }
  }
`

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  organizationName: string
}

export function InviteModal({ isOpen, onClose, organizationId, organizationName }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const [inviteToOrganization, { loading }] = useMutation(INVITE_TO_ORGANIZATION)

  // Generate invite link from code
  const inviteLink = inviteCode 
    ? `${window.location.origin}/join?code=${inviteCode}`
    : null

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInviteCode(null)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    try {
      const { data } = await inviteToOrganization({
        variables: { organizationId, email: email.trim() }
      })

      if (data?.inviteToOrganization?.success) {
        setInviteCode(data.inviteToOrganization.inviteCode)
        setEmail('')
      } else {
        setError(data?.inviteToOrganization?.error || 'Failed to create invite')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const handleCopyCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleClose = () => {
    setEmail('')
    setInviteCode(null)
    setError('')
    setCopiedCode(false)
    setCopiedLink(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to {organizationName}</DialogTitle>
          <DialogDescription>
            Send an invite to add a new member to your organization.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {inviteCode ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 mb-3">Invite created successfully!</p>
              <p className="text-xs text-slate-400 mb-4">Share the link or code with the user. Expires in 7 days.</p>
              
              {/* Invite Link */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Invite Link</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-slate-800 rounded text-xs text-white font-mono break-all">
                    {inviteLink}
                  </code>
                  <Button onClick={handleCopyLink} variant="ghost" className="shrink-0 text-xs">
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Invite Code */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Invite Code</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-slate-800 rounded text-sm text-white font-mono break-all">
                    {inviteCode}
                  </code>
                  <Button onClick={handleCopyCode} variant="ghost" className="shrink-0 text-xs">
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setInviteCode(null)}>
                Invite Another
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              An email with invite link will be sent to the user.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
