import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    ApolloLink,
} from '@apollo/client/core'

const httpLink = createHttpLink({
    uri: '/graphql',
})

/** Inject Authorization header from localStorage token on every request */
const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token')
    operation.setContext({
        headers: {
            authorization: token ? `Bearer ${token}` : '',
        },
    })
    return forward(operation)
})

export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: { fetchPolicy: 'cache-and-network' },
    },
})
