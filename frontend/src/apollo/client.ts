import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
  credentials: 'include',
})

const authLink = setContext((_, { headers }) => {
  const sessionKey = localStorage.getItem('sessionKey')
  return {
    headers: {
      ...headers,
      ...(sessionKey ? { 'X-Session-ID': sessionKey } : {}),
    }
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Project: {
        keyFields: ['id'],
      },
      Task: {
        keyFields: ['id'],
      },
      TaskComment: {
        keyFields: ['id'],
      },
      Organization: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
