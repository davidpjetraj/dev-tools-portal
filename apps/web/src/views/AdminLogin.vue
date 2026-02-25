<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo -->
      <div class="login-logo">
        <span class="login-logo__icon">⚡</span>
        <span class="login-logo__text">Dev Tools Portal</span>
      </div>

      <div class="card login-card">
        <h1 class="login-title">Admin Login</h1>
        <p class="login-subtitle">Sign in to manage the portal links.</p>

        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              class="form-input"
              type="email"
              placeholder="admin@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              class="form-input"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>

          <p v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</p>

          <button
            type="submit"
            class="btn btn-primary login-submit"
            :disabled="loading"
          >
            <span v-if="loading" class="btn-spinner"></span>
            <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
          </button>
        </form>
      </div>

      <p class="login-back">
        <router-link to="/">← Back to Portal</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true

  try {
    await auth.login(form.email, form.password)
    // Redirect to the originally requested page or the dashboard
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Strip GraphQL "GraphQL error:" prefix if present
      errorMsg.value = err.message.replace(/^.*?:\s*/, '')
    } else {
      errorMsg.value = 'An unexpected error occurred.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background-image:
    radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.login-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.login-logo__icon {
  font-size: 2rem;
}

.login-logo__text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  background: linear-gradient(135deg, #fff 30%, var(--color-primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-card {
  width: 100%;
  padding: var(--space-8);
}

.login-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.login-subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-8);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-submit {
  width: 100%;
  justify-content: center;
  padding: var(--space-4);
  font-size: var(--font-size-base);
  margin-top: var(--space-2);
}
.login-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

.login-back {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.login-back a {
  color: var(--color-primary-hover);
  transition: opacity var(--transition-fast);
}
.login-back a:hover { opacity: 0.8; }
</style>
