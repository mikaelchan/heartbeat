<template>
  <div class="page-shell">
    <header class="glass-panel" style="padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center;">
      <h1 class="gradient-text" style="font-size: 2.4rem; font-weight: 700;">Heartbeat</h1>
      <nav style="display: flex; gap: 1rem;">
        <RouterLink to="/">我们</RouterLink>
        <RouterLink to="/memories">回忆地图</RouterLink>
        <RouterLink to="/plans">未来计划</RouterLink>
        <RouterLink to="/messages">心动留言</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useHeartbeatStore } from '@/stores/heartbeat';

const store = useHeartbeatStore();

onMounted(() => {
  if (!store.relationship) {
    store.fetchAll();
  }
});
</script>

<style scoped>
nav a {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
  transition: background 0.2s ease, color 0.2s ease;
}

nav a.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  color: #091234;
}
</style>
