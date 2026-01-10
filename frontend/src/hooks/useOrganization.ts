import { createContext, useContext } from 'react'

interface OrganizationContextType {
  organizationId: string | null
  setOrganizationId: (id: string | null) => void
}

export const OrganizationContext = createContext<OrganizationContextType>({
  organizationId: null,
  setOrganizationId: () => {},
})

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}
