<template>
  <div class="dashboard">
    <AppHeader />

    <main class="dashboard__main">
      <div class="dashboard__header">
        <div>
          <h1 class="dashboard__title">Link Management</h1>
          <p class="dashboard__subtitle">Manage the links displayed on the portal.</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          + New Link
        </button>
      </div>

      <!-- Links table -->
      <div class="card dashboard__card">
        <div v-if="loading" class="dashboard__state">
          <div class="spinner"></div>
        </div>

        <div v-else-if="error" class="alert alert-error">
          Failed to load links: {{ error.message }}
        </div>

        <div v-else-if="links.length === 0" class="dashboard__empty">
          <span>🔗</span>
          <p>No links yet. Create your first one!</p>
        </div>

        <table v-else class="link-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Title</th>
              <th>URL</th>
              <th>Category</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="link in links" :key="link.id" class="link-table__row">
              <td class="link-table__icon-cell">
                <div class="link-table__icon-box">
                  <img v-if="isUrl(link.icon)" :src="link.icon!" :alt="link.title" class="link-table__img" />
                  <span v-else-if="link.icon" class="link-table__emoji">{{ link.icon }}</span>
                  <span v-else class="link-table__empty">—</span>
                </div>
              </td>
              <td class="link-table__title">{{ link.title }}</td>
              <td class="link-table__url">
                <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.url }}</a>
              </td>
              <td>
                <span class="badge">{{ link.category ?? 'General' }}</span>
              </td>
              <td>{{ link.order }}</td>
              <td class="link-table__actions">
                <button class="btn btn-ghost btn-sm" @click="openEditModal(link)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(link)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal card">
          <h2 class="modal__title">{{ isEditing ? 'Edit Link' : 'New Link' }}</h2>

          <form class="modal__form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label" for="f-title">Title *</label>
              <input id="f-title" v-model="form.title" class="form-input" required placeholder="e.g. GitHub" />
            </div>

            <div class="form-group">
              <label class="form-label" for="f-url">URL *</label>
              <input id="f-url" v-model="form.url" class="form-input" required type="url" placeholder="https://github.com" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="f-icon">Icon</label>
                <ImageUpload v-model="form.icon" />
              </div>
              <div class="form-group">
                <label class="form-label" for="f-category">Category</label>
                <input id="f-category" v-model="form.category" class="form-input" placeholder="DevOps" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="f-desc">Description</label>
              <textarea
                id="f-desc"
                v-model="form.description"
                class="form-input"
                rows="2"
                placeholder="Short description of the tool"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="f-order">Display order</label>
              <input id="f-order" v-model.number="form.order" class="form-input" type="number" placeholder="0" />
            </div>

            <p v-if="mutationError" class="alert alert-error">{{ mutationError }}</p>
            <p v-if="mutationSuccess" class="alert alert-success">{{ mutationSuccess }}</p>

            <div class="modal__footer">
              <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="mutating">
                <span v-if="mutating" class="btn-spinner"></span>
                {{ isEditing ? 'Save changes' : 'Create link' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal card modal--sm">
          <h2 class="modal__title">Delete link?</h2>
          <p class="modal__body">
            Are you sure you want to delete <strong>{{ deleteTarget.title }}</strong>? This action cannot be undone.
          </p>
          <p v-if="mutationError" class="alert alert-error">{{ mutationError }}</p>
          <div class="modal__footer">
            <button class="btn btn-ghost" @click="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger" :disabled="mutating" @click="handleDelete">
              <span v-if="mutating" class="btn-spinner"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import AppHeader from '@/components/AppHeader.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { GET_LINKS } from '@/graphql/queries'
import { CREATE_LINK, UPDATE_LINK, DELETE_LINK } from '@/graphql/mutations'
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

// ── Data fetching ──────────────────────────────────────────────
const { result, loading, error, refetch } = useQuery<{ links: Link[] }>(GET_LINKS, {}, {
  fetchPolicy: 'network-only',
})
const links = ref<Link[]>([])

// Sync query result into local ref
watch(() => result.value?.links, (val) => {
  if (val) links.value = val
}, { immediate: true })

// ── Mutations ─────────────────────────────────────────────────
const { mutate: createLink } = useMutation(CREATE_LINK)
const { mutate: updateLink } = useMutation(UPDATE_LINK)
const { mutate: deleteLink } = useMutation(DELETE_LINK)

// ── Modal state ────────────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const mutating = ref(false)
const mutationError = ref('')
const mutationSuccess = ref('')
const deleteTarget = ref<Link | null>(null)

const emptyForm = () => ({ title: '', url: '', icon: '', description: '', category: '', order: 0 })
const form = reactive(emptyForm())

function openCreateModal() {
  Object.assign(form, emptyForm())
  isEditing.value = false
  editingId.value = null
  mutationError.value = ''
  mutationSuccess.value = ''
  showModal.value = true
}

function openEditModal(link: Link) {
  Object.assign(form, {
    title: link.title,
    url: link.url,
    icon: link.icon ?? '',
    description: link.description ?? '',
    category: link.category ?? '',
    order: link.order,
  })
  isEditing.value = true
  editingId.value = link.id
  mutationError.value = ''
  mutationSuccess.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

// ── Submit (create or update) ──────────────────────────────────
async function handleSubmit() {
  mutationError.value = ''
  mutationSuccess.value = ''
  mutating.value = true

  const input = {
    title: form.title,
    url: form.url,
    icon: form.icon || null,
    description: form.description || null,
    category: form.category || 'General',
    order: form.order,
  }

  try {
    if (isEditing.value && editingId.value) {
      await updateLink({ id: editingId.value, input })
      mutationSuccess.value = 'Link updated successfully.'
    } else {
      await createLink({ input })
      mutationSuccess.value = 'Link created successfully.'
    }
    await refetch()
    setTimeout(closeModal, 800)
  } catch (err: unknown) {
    mutationError.value = err instanceof Error ? err.message : 'An error occurred.'
  } finally {
    mutating.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────
function confirmDelete(link: Link) {
  mutationError.value = ''
  deleteTarget.value = link
}

async function handleDelete() {
  if (!deleteTarget.value) return
  mutating.value = true
  mutationError.value = ''

  try {
    await deleteLink({ id: deleteTarget.value.id })
    await refetch()
    deleteTarget.value = null
  } catch (err: unknown) {
    mutationError.value = err instanceof Error ? err.message : 'An error occurred.'
  } finally {
    mutating.value = false
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.dashboard__main {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-8);
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.dashboard__title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.dashboard__subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

.dashboard__card {
  padding: 0;
  overflow: hidden;
}

.dashboard__state {
  display: flex;
  justify-content: center;
  padding: var(--space-16);
}

.dashboard__empty {
  text-align: center;
  padding: var(--space-16);
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}
.dashboard__empty span {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-4);
}

/* Table */
.link-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.link-table thead tr {
  border-bottom: 1px solid var(--color-border);
}

.link-table th {
  text-align: left;
  padding: var(--space-4) var(--space-6);
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.link-table__row {
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}
.link-table__row:last-child {
  border-bottom: none;
}
.link-table__row:hover {
  background: var(--color-surface-raised);
}

.link-table td {
  padding: var(--space-4) var(--space-6);
  vertical-align: middle;
}

.link-table__icon-cell {
  width: 80px;
}
.link-table__icon-box {
  width: 40px;
  height: 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.link-table__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}
.link-table__emoji {
  font-size: 1.5rem;
}
.link-table__empty {
  color: var(--color-text-dim);
}

.link-table__title {
  font-weight: 600;
}

.link-table__url a {
  color: var(--color-accent);
  font-family: monospace;
  font-size: var(--font-size-xs);
  max-width: 260px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.link-table__url a:hover {
  text-decoration: underline;
}

.link-table__actions {
  display: flex;
  gap: var(--space-2);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal--sm {
  max-width: 400px;
}

.modal__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--space-6);
}

.modal__body {
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@media (max-width: 768px) {
  .dashboard__main {
    padding: var(--space-4);
  }
  .link-table th:nth-child(3),
  .link-table td:nth-child(3),
  .link-table th:nth-child(5),
  .link-table td:nth-child(5) {
    display: none;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
