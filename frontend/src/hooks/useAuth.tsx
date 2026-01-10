import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { gql, useApolloClient, useLazyQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  username: string
  firstName: string
  lastName: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      sessionKey
      user {
        id
        username
        firstName
        lastName
      }
      error
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      firstName
      lastName
    }
  }
`

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const client = useApolloClient()

  const [fetchMe] = useLazyQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me)
      } else {
        // Server returned null user, clear session
        localStorage.removeItem('sessionKey')
        setUser(null)
      }
      setIsLoading(false)
    },
    onError: () => {
      localStorage.removeItem('sessionKey')
      setUser(null)
      setIsLoading(false)
    }
  })

  // Check session on mount
  useEffect(() => {
    const sessionKey = localStorage.getItem('sessionKey')
    if (sessionKey) {
      // We have a session key, try to fetch user
      fetchMe()
    } else {
      // No session key, not authenticated
      setIsLoading(false)
    }
  }, [fetchMe])

  const login = async () => {
    await fetchMe()
    navigate('/')
  }

  const logout = async () => {
    try {
      await client.mutate({ mutation: LOGOUT_MUTATION })
    } catch (e) {
      console.error('Logout failed', e)
    } finally {
      localStorage.removeItem('sessionKey')
      setUser(null)
      await client.resetStore()
      navigate('/login')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
