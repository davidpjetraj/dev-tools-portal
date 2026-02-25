<template>
  <div class="image-upload">
    <!-- Preview of already uploaded or selected image -->
    <div v-if="modelValue" class="image-upload__preview">
      <img :src="modelValue" alt="Uploaded icon" class="image-upload__img" />
      <button type="button" class="image-upload__remove" @click="handleRemove" title="Remove image">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <!-- Dropzone/Clickzone for uploading -->
    <div
      v-else
      class="image-upload__dropzone"
      :class="{ 'image-upload__dropzone--loading': loading }"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        class="image-upload__input"
        accept="image/*"
        @change="handleFileChange"
      />
      
      <div v-if="loading" class="image-upload__spinner"></div>
      <div v-else class="image-upload__placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Upload Icon</span>
      </div>
    </div>
    
    <p v-if="error" class="image-upload__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string | null | undefined
  endpoint?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const loading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  if (loading.value) return
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  await uploadFile(file)
  
  // Reset input so the same file can be selected again if needed
  target.value = ''
}

async function uploadFile(file: File) {
  loading.value = true
  error.value = ''

  const formData = new FormData()
  formData.append('files', file)

  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`/v1/${props.endpoint || 'files/upload-files'}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Upload failed')
    }

    const data = await response.json()
    const url = data[0].url
    emit('update:modelValue', url)
  } catch (err: any) {
    error.value = err.message || 'An error occurred during upload'
    console.error('Upload error:', err)
  } finally {
    loading.value = false
  }
}

function handleRemove() {
  emit('update:modelValue', null)
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.image-upload__dropzone {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  background: var(--color-surface-raised);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.image-upload__dropzone:hover:not(.image-upload__dropzone--loading) {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.05);
}

.image-upload__dropzone--loading {
  cursor: wait;
}

.image-upload__input {
  display: none;
}

.image-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.image-upload__placeholder svg {
  color: var(--color-text-dim);
}

.image-upload__preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  overflow: hidden;
}

.image-upload__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--space-2);
}

.image-upload__remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(248, 113, 113, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background var(--transition-fast);
  z-index: 10;
}

.image-upload__remove:hover {
  background: var(--color-danger);
}

.image-upload__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.image-upload__error {
  color: var(--color-danger);
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
