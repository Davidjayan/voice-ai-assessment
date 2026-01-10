import { createContext, useContext, useState, ReactNode } from 'react'
import { gql, useApolloClient, useQuery } from '@apollo/client'
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const client = useApolloClient()

  const { data, loading, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    },
    onError: () => {
      setIsAuthenticated(false)
    }
  })

  const login = async () => {
    // Session key is handled by cookie now
    // We just need to refetch the user
    await refetch()
    setIsAuthenticated(true)
    navigate('/')
  }

  const logout = async () => {
    try {
      await client.mutate({ mutation: LOGOUT_MUTATION })
    } catch (e) {
      console.error('Logout failed', e)
    } finally {
      setIsAuthenticated(false)
      await client.resetStore()
      navigate('/login')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user: data?.me || null, isAuthenticated, login, logout }}>
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
