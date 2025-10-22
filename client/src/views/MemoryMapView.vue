<template>
  <div class="memories-view">
    <section class="glass-panel">
      <div class="map-header">
        <h3 class="section-title">我们的足迹</h3>
        <button type="button" class="add-memory-button" @click="openMemoryDialog">
          记录新的足迹
        </button>
      </div>
      <div v-if="store.memories.length" class="map-wrapper">
        <div id="memory-map"></div>
        <aside class="memory-list">
          <article v-for="memory in store.memories" :key="memory._id ?? memory.title" class="memory-card">
            <div class="memory-media">
              <img v-if="memory.photoUrl" :src="memory.photoUrl" :alt="memory.title" />
              <div v-else class="memory-placeholder" aria-hidden="true">
                <span class="placeholder-icon">📍</span>
              </div>
            </div>
            <div class="memory-content">
              <h4>{{ memory.title }}</h4>
              <p class="place">{{ memory.location.placeName }}</p>
              <p class="date">{{ formatDate(memory.happenedOn) }}</p>
              <p class="description">{{ memory.description }}</p>
            </div>
          </article>
        </aside>
      </div>
      <p v-else-if="isLoading" class="map-hint">正在为你加载那些心动瞬间...</p>
      <p v-else class="map-hint">暂时还没有记录足迹，快去计划下一次冒险吧！</p>
    </section>
    <div v-if="showMemoryDialog" class="memory-dialog-overlay" @click.self="closeMemoryDialog">
      <form class="memory-dialog" @submit.prevent="submitMemory">
        <h4>记录新的足迹</h4>
        <label>
          标题
          <input v-model="newMemory.title" type="text" placeholder="写下这个瞬间的名字" required />
        </label>
        <label>
          发生日期
          <input v-model="newMemory.happenedOn" type="date" required />
        </label>
        <label>
          地点
          <div class="location-search">
            <input
              v-model="placeQuery"
              type="text"
              placeholder="输入地点名称"
              @keyup.enter.prevent="searchPlaces"
            />
            <button type="button" @click="searchPlaces" :disabled="placeSearching || !placeQuery.trim()">
              {{ placeSearching ? '搜索中...' : '搜索' }}
            </button>
          </div>
        </label>
        <p v-if="placeError" class="place-error">{{ placeError }}</p>
        <ul v-if="placeResults.length" class="location-results">
          <li v-for="place in placeResults" :key="place.id">
            <button type="button" @click="selectPlace(place)">
              <strong>{{ place.name }}</strong>
              <span>{{ place.address }}</span>
            </button>
          </li>
        </ul>
        <div v-if="selectedPlace" class="selected-place">
          <p>已选择：<strong>{{ selectedPlace.name }}</strong></p>
          <button type="button" class="ghost" @click="clearSelectedPlace">重新选择</button>
        </div>
        <label>
          上传照片（可选）
          <input ref="memoryFileInput" type="file" accept="image/*" @change="onMemoryFileChange" />
        </label>
        <label>
          或使用图片链接（可选）
          <input v-model="newMemory.photoUrl" type="url" placeholder="https://..." />
        </label>
        <div v-if="newMemory.photoPreview" class="memory-image-preview">
          <img :src="newMemory.photoPreview" alt="照片预览" />
          <button type="button" class="remove-image" @click="removeMemoryImage">移除图片</button>
        </div>
        <label>
          回忆描述
          <textarea v-model="newMemory.description" rows="3" placeholder="记录下那份心动..."></textarea>
        </label>
        <div class="dialog-actions">
          <button type="button" class="ghost" @click="closeMemoryDialog">取消</button>
          <button type="submit" :disabled="!canSubmitMemory || memorySubmitting">
            {{ memorySubmitting ? '记录中...' : '保存足迹' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import * as L from 'leaflet';
import dayjs from 'dayjs';
import { useHeartbeatStore } from '@/stores/heartbeat';
import { readFileAsDataUrl } from '@/utils/file';
import { uploadImage } from '@/utils/upload';
import type { Memory } from '@/types';

import 'leaflet/dist/leaflet.css';

interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
const store = useHeartbeatStore();
const isLoading = computed(() => store.memoriesLoading);
const memorySubmitting = ref(false);
const newMemory = reactive({
  title: '',
  description: '',
  photoUrl: '',
  photoPreview: '',
  photoFile: null as File | null,
  happenedOn: ''
});
const showMemoryDialog = ref(false);
const memoryFileInput = ref<HTMLInputElement | null>(null);
const placeQuery = ref('');
const placeResults = ref<PlaceSuggestion[]>([]);
const selectedPlace = ref<PlaceSuggestion | null>(null);
const placeSearching = ref(false);
const placeError = ref('');

const formatDate = (value: string) => dayjs(value).format('YYYY 年 M 月 D 日');

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createMarkerIcon = (memory: Memory) => {
  if (memory.photoUrl) {
    const safePhoto = escapeHtml(memory.photoUrl);
    const safeTitle = escapeHtml(memory.title);
    return L.divIcon({
      className: 'memory-marker memory-marker--photo',
      html: `<div class="memory-marker-thumb"><img src="${safePhoto}" alt="${safeTitle}" /></div>`,
      iconSize: [56, 64],
      iconAnchor: [28, 56],
      popupAnchor: [0, -52]
    });
  }

  return L.divIcon({
    className: 'memory-marker memory-marker--default',
    html: '<div class="memory-marker-pin">📍</div>',
    iconSize: [40, 48],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36]
  });
};

const createMarkerPopup = (memory: Memory) => {
  const safeTitle = escapeHtml(memory.title);
  const safePlace = escapeHtml(memory.location.placeName);
  const safeDate = escapeHtml(formatDate(memory.happenedOn));
  const description = memory.description ? `<p>${escapeHtml(memory.description)}</p>` : '';
  const photo = memory.photoUrl
    ? `<div class="memory-popup-thumb"><img src="${escapeHtml(memory.photoUrl)}" alt="${safeTitle}" /></div>`
    : '';

  return `<div class="memory-popup">${photo}<strong>${safeTitle}</strong><br /><span>${safePlace}</span><br /><small>${safeDate}</small>${description}</div>`;
};

const renderMap = async () => {
  if (!store.memories.length) {
    if (map) {
      map.remove();
      map = null;
      markersLayer = null;
    }
    return;
  }

  await nextTick();

  if (!map) {
    map = L.map('memory-map', {
      zoomControl: false
    }).setView([store.memories[0].location.lat, store.memories[0].location.lng], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  }

  if (markersLayer) {
    markersLayer.clearLayers();
  } else if (map) {
    markersLayer = L.layerGroup().addTo(map);
  }

  store.memories.forEach((memory) => {
    const marker = L.marker([memory.location.lat, memory.location.lng], {
      icon: createMarkerIcon(memory)
    }).bindPopup(createMarkerPopup(memory));

    (markersLayer as L.LayerGroup).addLayer(marker);
  });
};

onMounted(async () => {
  if (!store.memories.length) {
    await store.fetchMemories();
  }
  await renderMap();
});

watch(
  () => store.memories,
  async (memories) => {
    if (memories.length) {
      await renderMap();
    } else if (map) {
      map.remove();
      map = null;
      markersLayer = null;
    }
  },
  { deep: true }
);

const canSubmitMemory = computed(() => {
  return newMemory.title.trim() && newMemory.happenedOn && selectedPlace.value;
});

const resetMemoryForm = () => {
  Object.assign(newMemory, {
    title: '',
    description: '',
    photoUrl: '',
    photoPreview: '',
    photoFile: null,
    happenedOn: ''
  });
  placeQuery.value = '';
  placeResults.value = [];
  selectedPlace.value = null;
  placeError.value = '';
  if (memoryFileInput.value) {
    memoryFileInput.value.value = '';
  }
};

const openMemoryDialog = () => {
  resetMemoryForm();
  showMemoryDialog.value = true;
};

const closeMemoryDialog = () => {
  showMemoryDialog.value = false;
  resetMemoryForm();
};

const onMemoryFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    newMemory.photoFile = null;
    newMemory.photoPreview = '';
    return;
  }
  newMemory.photoFile = file;
  try {
    newMemory.photoPreview = await readFileAsDataUrl(file);
  } catch (error) {
    console.error('Failed to read memory image', error);
    newMemory.photoFile = null;
    newMemory.photoPreview = '';
  }
};

const removeMemoryImage = () => {
  newMemory.photoFile = null;
  newMemory.photoPreview = '';
  newMemory.photoUrl = '';
  if (memoryFileInput.value) {
    memoryFileInput.value.value = '';
  }
};

const searchPlaces = async () => {
  const query = placeQuery.value.trim();
  if (!query) return;
  placeSearching.value = true;
  placeError.value = '';
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error('地点搜索失败');
    }
    const data: Array<{ place_id: string; display_name: string; lat: string; lon: string }> =
      await response.json();
    placeResults.value = data.map((item) => ({
      id: item.place_id,
      name: item.display_name,
      address: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon)
    }));
    if (!placeResults.value.length) {
      placeError.value = '没有找到相关地点，请尝试输入更详细的信息。';
    }
  } catch (error) {
    console.error('Failed to search place', error);
    placeError.value = '地点搜索失败，请稍后重试。';
  } finally {
    placeSearching.value = false;
  }
};

const selectPlace = (place: PlaceSuggestion) => {
  selectedPlace.value = place;
  placeQuery.value = place.name;
  placeResults.value = [];
  placeError.value = '';
};

const clearSelectedPlace = () => {
  selectedPlace.value = null;
  placeQuery.value = '';
  placeResults.value = [];
  placeError.value = '';
};

const submitMemory = async () => {
  if (!canSubmitMemory.value || memorySubmitting.value) return;
  memorySubmitting.value = true;
  try {
    const place = selectedPlace.value;
    if (!place) return;
    let photoUrl = newMemory.photoUrl.trim();
    if (!photoUrl && newMemory.photoFile) {
      const result = await uploadImage(newMemory.photoFile);
      photoUrl = result.url;
    }

    await store.addMemory({
      title: newMemory.title,
      description: newMemory.description,
      happenedOn: newMemory.happenedOn,
      location: {
        placeName: place.name,
        lat: place.lat,
        lng: place.lng
      },
      ...(photoUrl ? { photoUrl } : {})
    });
    closeMemoryDialog();
    if (map) {
      map.setView([place.lat, place.lng], 6, { animate: true });
    }
  } finally {
    memorySubmitting.value = false;
  }
};
</script>

<style scoped>
.memories-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.add-memory-button {
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  background: var(--accent);
  color: #fff;
  box-shadow: 0 10px 24px rgba(255, 105, 180, 0.25);
  cursor: pointer;
}

.add-memory-button:hover {
  filter: brightness(1.05);
}

.map-wrapper {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 1.5rem;
  min-height: 480px;
}

.map-hint {
  margin: 2rem 0;
  text-align: center;
  color: var(--text-secondary);
}

#memory-map {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--map-shadow);
}

.memory-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.memory-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: center;
  background: var(--memory-card-surface);
  border-radius: 20px;
  padding: 1rem;
}

.memory-media {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--memory-card-placeholder, rgba(255, 255, 255, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
}

.memory-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.memory-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--accent);
}

.memory-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.place {
  font-weight: 600;
}

.date {
  opacity: 0.7;
}

.description {
  opacity: 0.85;
  line-height: 1.4;
}

.memory-dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--dialog-overlay);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 80;
}

.memory-dialog {
  background: var(--dialog-surface);
  border-radius: 24px;
  padding: 2rem;
  width: min(480px, 100%);
  height: min(660px, 90vh);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  overflow-y: auto;
  border: 1px solid var(--dialog-border);
  color: var(--text-primary);
}

.memory-dialog h4 {
  margin: 0 0 0.5rem;
}

.memory-dialog label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 600;
}

.memory-dialog input[type='text'],
.memory-dialog input[type='date'],
.memory-dialog input[type='url'],
.memory-dialog input[type='file'],
.memory-dialog textarea {
  border-radius: 12px;
  border: 1px solid var(--dialog-input-border);
  padding: 0.65rem 0.85rem;
  background: var(--dialog-input-background);
  color: inherit;
  font-family: inherit;
}

.memory-dialog input[type='file'] {
  padding: 0.45rem 0.85rem;
}

.memory-dialog textarea {
  resize: vertical;
}

.memory-image-preview {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  max-height: 240px;
}

.memory-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-image {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}

.location-search {
  display: flex;
  gap: 0.75rem;
}

.location-search input {
  flex: 1;
}

.location-search button {
  min-width: 92px;
}

.location-results {
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  max-height: 220px;
  overflow-y: auto;
}

.location-results li + li {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.location-results button {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: inherit;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  cursor: pointer;
}

.location-results button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.location-results strong {
  font-weight: 600;
}

.location-results span {
  font-size: 0.9rem;
  opacity: 0.8;
}

.selected-place {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
}

.selected-place p {
  margin: 0;
}

.selected-place .ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: inherit;
}

.place-error {
  color: #ff9aa2;
  margin: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.dialog-actions button {
  min-width: 110px;
}

.dialog-actions .ghost {
  background: transparent;
  border: 1px solid var(--dialog-ghost-border);
  color: inherit;
}

:deep(.memory-marker) {
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.memory-marker-thumb) {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.25);
  border: 3px solid #fff;
  background: #fff;
}

:deep(.memory-marker-thumb img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

:deep(.memory-marker-pin) {
  display: grid;
  place-items: center;
  width: 40px;
  height: 48px;
  border-radius: 18px;
  background: var(--accent);
  color: #fff;
  font-size: 1.25rem;
  box-shadow: 0 10px 20px rgba(255, 105, 180, 0.25);
}

:deep(.memory-popup) {
  display: grid;
  gap: 0.35rem;
  max-width: 220px;
}

:deep(.memory-popup-thumb) {
  width: 100%;
  max-height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
}

:deep(.memory-popup-thumb img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.memory-popup p) {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-primary);
}

@media (max-width: 980px) {
  .map-wrapper {
    grid-template-columns: 1fr;
  }

  .memory-list {
    max-height: none;
    padding-right: 0;
  }
}

@media (max-width: 768px) {
  .add-memory-button {
    width: 100%;
  }
}
</style>
