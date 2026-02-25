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
    async function login(inputUsername: string, password: string): Promise<void> {
        const { data } = await apolloClient.mutate({
            mutation: LOGIN,
            variables: { username: inputUsername, password },
        })

        const { token: newToken, username: newUsername } = data.login

        token.value = newToken
        username.value = newUsername
        localStorage.setItem(TOKEN_KEY, newToken)
        localStorage.setItem(USERNAME_KEY, newUsername)
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
