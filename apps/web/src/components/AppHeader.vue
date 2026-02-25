<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__brand">
        <span class="app-header__logo">⚡</span>
        <span class="app-header__name">Dev Tools Portal</span>
      </div>

      <nav class="app-header__nav">
        <router-link v-if="!auth.isAuthenticated" to="/admin/login" class="btn btn-ghost btn-sm">
          Admin Login
        </router-link>
        <template v-else>
          <router-link to="/admin" class="btn btn-ghost btn-sm">Dashboard</router-link>
          <router-link to="/" class="btn btn-ghost btn-sm">Portal</router-link>
          <button class="btn btn-danger btn-sm" @click="handleLogout">Logout</button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 15, 20, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.app-header__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.app-header__logo {
  font-size: 1.5rem;
}

.app-header__name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  background: linear-gradient(135deg, #fff 30%, var(--color-primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 640px) {
  .app-header__inner {
    padding: var(--space-4);
  }

  .app-header__name {
    display: none;
  }
}
</style>
