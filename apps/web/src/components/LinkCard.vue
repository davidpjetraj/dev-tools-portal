<template>
  <div class="link-card" @click="openLink">
    <div class="link-card__icon">
      <!-- Render as image if icon looks like a URL, otherwise as emoji/text -->
      <img v-if="isUrl(link.icon)" :src="link.icon!" :alt="link.title" class="link-card__img" />
      <span v-else-if="link.icon" class="link-card__emoji">{{ link.icon }}</span>
      <span v-else class="link-card__default-icon">🔗</span>
    </div>

    <div class="link-card__body">
      <h3 class="link-card__title">{{ link.title }}</h3>
      <p v-if="link.description" class="link-card__desc">{{ link.description }}</p>
      <span class="link-card__url">{{ displayUrl }}</span>
    </div>

    <div class="link-card__arrow">↗</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isUrl } from '@/utils/icon'

interface Link {
  id: string
  title: string
  url: string
  icon?: string | null
  description?: string | null
  category?: string | null
  order: number
}

const props = defineProps<{ link: Link }>()


const displayUrl = computed(() => {
  try {
    const u = new URL(props.link.url)
    return u.hostname
  } catch {
    return props.link.url
  }
})

function openLink() {
  window.open(props.link.url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.link-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.link-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-glow), transparent 60%);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.link-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-card), var(--shadow-glow);
}

.link-card:hover::before {
  opacity: 1;
}

.link-card__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.link-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--space-2);
}

.link-card__emoji {
  font-size: 1.5rem;
  line-height: 1;
}

.link-card__default-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.link-card__body {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.link-card__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-card__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.link-card__url {
  font-size: var(--font-size-xs);
  color: var(--color-text-dim);
  font-family: monospace;
}

.link-card__arrow {
  flex-shrink: 0;
  font-size: 1.1rem;
  color: var(--color-text-dim);
  transition: color var(--transition-fast), transform var(--transition-fast);
  position: relative;
  z-index: 1;
}

.link-card:hover .link-card__arrow {
  color: var(--color-primary-hover);
  transform: translate(2px, -2px);
}
</style>
