import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
  credentials: 'include',
})

export const apolloClient = new ApolloClient({
  link: httpLink,
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
