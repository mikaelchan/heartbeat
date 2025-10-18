<template>
  <section class="glass-panel" v-if="store.memories.length">
    <h3 class="section-title">我们的足迹</h3>
    <div class="map-wrapper">
      <div id="memory-map"></div>
      <aside class="memory-list">
        <article v-for="memory in store.memories" :key="memory._id ?? memory.title" class="memory-card">
          <img :src="memory.photoUrl" :alt="memory.title" />
          <div>
            <h4>{{ memory.title }}</h4>
            <p class="place">{{ memory.location.placeName }}</p>
            <p class="date">{{ formatDate(memory.happenedOn) }}</p>
            <p class="description">{{ memory.description }}</p>
          </div>
        </article>
      </aside>
    </div>
  </section>
  <section class="glass-panel" v-else-if="isLoading">
    <p>正在为你加载那些心动瞬间...</p>
  </section>
  <section class="glass-panel" v-else>
    <p>暂时还没有记录足迹，快去计划下一次冒险吧！</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import * as L from 'leaflet';
import dayjs from 'dayjs';
import { useHeartbeatStore } from '@/stores/heartbeat';

import 'leaflet/dist/leaflet.css';

let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
const store = useHeartbeatStore();
const isLoading = computed(() => store.memoriesLoading);

const formatDate = (value: string) => dayjs(value).format('YYYY 年 M 月 D 日');

const renderMap = () => {
  if (!store.memories.length) return;
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
    L.marker([memory.location.lat, memory.location.lng])
      .bindPopup(`<strong>${memory.title}</strong><br>${memory.location.placeName}`)
      .addTo(markersLayer as L.LayerGroup);
  });
};

onMounted(async () => {
  if (!store.memories.length) {
    await store.fetchMemories();
  }
  renderMap();
});

watch(
  () => store.memories,
  (memories) => {
    if (memories.length) {
      renderMap();
    }
  },
  { deep: true }
);
</script>

<style scoped>
.map-wrapper {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 1.5rem;
  min-height: 480px;
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

.memory-card img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 16px;
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

@media (max-width: 980px) {
  .map-wrapper {
    grid-template-columns: 1fr;
  }

  .memory-list {
    max-height: none;
    padding-right: 0;
  }
}
</style>
