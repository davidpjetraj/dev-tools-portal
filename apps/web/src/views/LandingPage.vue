<template>
  <div class="landing">
    <AppHeader />

    <main class="landing__main">
      <!-- Hero -->
      <section class="landing__hero">
        <div class="landing__hero-badge badge">Internal Developer Tools</div>
        <h1 class="landing__hero-title">
          Your team's<br />
          <span class="landing__hero-gradient">command center</span>
        </h1>
        <p class="landing__hero-sub">
          Quick access to all the tools your team needs to build, ship, and operate.
        </p>
      </section>

      <!-- Category filter -->
      <section v-if="categories.length > 1" class="landing__filters">
        <button
          class="filter-pill"
          :class="{ 'filter-pill--active': activeCategory === null }"
          @click="activeCategory = null"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          class="filter-pill"
          :class="{ 'filter-pill--active': activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </section>

      <!-- Loading state -->
      <div v-if="loading" class="landing__state">
        <div class="spinner"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="landing__state">
        <p class="alert alert-error">Failed to load links. Please try again later.</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredLinks.length === 0" class="landing__state">
        <div class="landing__empty">
          <span class="landing__empty-icon">🔧</span>
          <h2>No links yet</h2>
          <p>An administrator can add links from the <router-link to="/admin/login">admin dashboard</router-link>.</p>
        </div>
      </div>

      <!-- Links grid grouped by category -->
      <div v-else class="landing__content">
        <div
          v-for="(group, category) in groupedLinks"
          :key="category"
          class="landing__group"
        >
          <div v-if="Object.keys(groupedLinks).length > 1" class="landing__group-header">
            <h2 class="landing__group-title">{{ category }}</h2>
            <div class="landing__group-line"></div>
          </div>

          <div class="landing__grid">
            <LinkCard
              v-for="(link, idx) in group"
              :key="link.id"
              :link="link"
              class="stagger-item"
              :style="{ animationDelay: `${idx * 60}ms` }"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="landing__footer">
      <p>Dev Tools Portal &mdash; Internal use only</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import AppHeader from '@/components/AppHeader.vue'
import LinkCard from '@/components/LinkCard.vue'
import { GET_LINKS, GET_CATEGORIES } from '@/graphql/queries'

interface Link {
  id: string
  title: string
  url: string
  icon?: string | null
  description?: string | null
  category?: string | null
  order: number
}

const activeCategory = ref<string | null>(null)

// Fetch categories for filter pills
const { result: catResult } = useQuery(GET_CATEGORIES)
const categories = computed<string[]>(() => catResult.value?.categories ?? [])

// Fetch links — re-queries when category filter changes
const { result, loading, error } = useQuery<{ links: Link[] }>(
  GET_LINKS,
  () => ({ category: activeCategory.value ?? undefined }),
  { fetchPolicy: 'cache-and-network' },
)

const links = computed<Link[]>(() => result.value?.links ?? [])

// When active category changes via external filter, refresh is automatic via reactive variables
const filteredLinks = computed(() => links.value)

// Group links by category
const groupedLinks = computed<Record<string, Link[]>>(() => {
  return filteredLinks.value.reduce(
    (acc, link) => {
      const cat = link.category ?? 'General'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(link)
      return acc
    },
    {} as Record<string, Link[]>,
  )
})
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing__main {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-8);
  width: 100%;
}

/* Hero */
.landing__hero {
  text-align: center;
  margin-bottom: var(--space-12);
}

.landing__hero-badge {
  margin-bottom: var(--space-4);
}

.landing__hero-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
  color: var(--color-text);
}

.landing__hero-gradient {
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.landing__hero-sub {
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  max-width: 500px;
  margin: 0 auto;
}

/* Category filters */
.landing__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-8);
}

.filter-pill {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.filter-pill:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
}
.filter-pill--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* States */
.landing__state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.landing__empty {
  text-align: center;
  color: var(--color-text-muted);
}
.landing__empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-4);
}
.landing__empty h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-2);
}
.landing__empty a {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

/* Groups */
.landing__group {
  margin-bottom: var(--space-12);
}

.landing__group-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.landing__group-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.landing__group-line {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

/* Grid */
.landing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

/* Footer */
.landing__footer {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-dim);
  font-size: var(--font-size-sm);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .landing__main {
    padding: var(--space-8) var(--space-4);
  }
  .landing__hero-title {
    font-size: var(--font-size-3xl);
  }
  .landing__grid {
    grid-template-columns: 1fr;
  }
}
</style>
