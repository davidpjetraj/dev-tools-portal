import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@/apollo/client'
import { LOGIN } from '@/graphql/mutations'

const TOKEN_KEY = 'auth_token'
const USERNAME_KEY = 'auth_username'

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
    const username = ref<string | null>(localStorage.getItem(USERNAME_KEY))

    const isAuthenticated = computed(() => !!token.value)

    /**
     * Call the login mutation, store the returned JWT in memory and localStorage.
     * Throws on invalid credentials so the login form can display the error.
     */
    async function login(email: string, password: string): Promise<void> {
        const { data } = await apolloClient.mutate({
            mutation: LOGIN,
            variables: { input: { email, password } },
        })

        const { access_token, refresh_token } = data.signIn

        token.value = access_token
        // Note: The API doesn't return username on login, so we might want to fetch it later if needed
        username.value = email
        localStorage.setItem(TOKEN_KEY, access_token)
        localStorage.setItem(USERNAME_KEY, email)
    }

    function logout(): void {
        token.value = null
        username.value = null
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USERNAME_KEY)
        // Clear Apollo cache to avoid stale authenticated data
        apolloClient.clearStore()
    }

    return { token, username, isAuthenticated, login, logout }
})
