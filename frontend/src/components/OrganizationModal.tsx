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

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $description: String) {
    createOrganization(name: $name, description: $description) {
      success
      error
      organization {
        id
        name
        slug
      }
    }
  }
`

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

interface OrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (organizationId: string) => void
}

type TabType = 'create' | 'join'

export function OrganizationModal({ isOpen, onClose, onSuccess }: OrganizationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('create')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  const [createOrganization, { loading: createLoading }] = useMutation(CREATE_ORGANIZATION)
  const [joinOrganization, { loading: joinLoading }] = useMutation(JOIN_ORGANIZATION)

  const loading = createLoading || joinLoading

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Organization name is required')
      return
    }

    try {
      const { data } = await createOrganization({
        variables: { name: name.trim(), description: description.trim() }
      })

      if (data?.createOrganization?.success) {
        onSuccess(data.createOrganization.organization.id)
        handleClose()
      } else {
        setError(data?.createOrganization?.error || 'Failed to create organization')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!inviteCode.trim()) {
      setError('Invite code is required')
      return
    }

    try {
      const { data } = await joinOrganization({
        variables: { inviteCode: inviteCode.trim() }
      })

      if (data?.joinOrganization?.success) {
        onSuccess(data.joinOrganization.organization.id)
        handleClose()
      } else {
        setError(data?.joinOrganization?.error || 'Failed to join organization')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setInviteCode('')
    setError('')
    setActiveTab('create')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Organization</DialogTitle>
          <DialogDescription>
            Create a new organization or join an existing one.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { setActiveTab('create'); setError('') }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Create New
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('join'); setError('') }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'join'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Join Existing
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Organization Name"
              placeholder="My Company"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Description (optional)"
              placeholder="A brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              label="Invite Code"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask your organization admin for an invite code.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join Organization'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
