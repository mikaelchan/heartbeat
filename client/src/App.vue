<template>
  <div class="page-shell" v-if="auth.initialized">
    <header class="glass-panel app-header">
      <div class="brand-block">
        <h1 class="gradient-text">Heartbeat</h1>
        <p class="greeting">{{ greeting }}</p>
      </div>
      <nav v-if="auth.isAuthenticated">
        <RouterLink to="/">我们</RouterLink>
        <RouterLink to="/memories">回忆地图</RouterLink>
        <RouterLink to="/plans">未来计划</RouterLink>
        <RouterLink to="/messages">心动留言</RouterLink>
      </nav>
      <div class="auth-actions">
        <template v-if="auth.isAuthenticated">
          <button @click="handleLogout">退出登录</button>
        </template>
        <template v-else>
          <RouterLink to="/login">登录</RouterLink>
          <RouterLink class="primary" to="/register">注册</RouterLink>
        </template>
      </div>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useHeartbeatStore } from '@/stores/heartbeat';
import { useAuthStore } from '@/stores/auth';
import { getGenderHonorific } from '@/utils/user';

const store = useHeartbeatStore();
const auth = useAuthStore();
const router = useRouter();

const greeting = computed(() => {
  if (!auth.user) {
    return '请登录后开始记录你们的故事';
  }
  const suffix = getGenderHonorific(auth.user.gender);
  return `欢迎回来，${auth.user.username}${suffix}`;
});

const handleLogout = () => {
  auth.logout();
  store.reset();
  router.push('/login');
};

onMounted(async () => {
  await auth.initialize();
  if (auth.isAuthenticated) {
    await store.fetchAll();
  }
});

watch(
  () => auth.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await store.fetchAll();
    } else {
      store.reset();
    }
  }
);
</script>

<style scoped>
.app-header {
  padding: 1.25rem 2rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
}

.brand-block h1 {
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0;
}

.brand-block {
  display: flex;
  flex-direction: column;
}

.greeting {
  margin: 0.25rem 0 0;
  opacity: 0.8;
  font-size: 0.95rem;
}

nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

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

.auth-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.auth-actions a,
.auth-actions button {
  border-radius: 999px;
  padding: 0.4rem 1rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
}

.auth-actions .primary {
  background: rgba(255, 255, 255, 0.6);
  color: #091234;
}

.auth-actions button:hover,
.auth-actions a:hover {
  background: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .app-header {
    grid-template-columns: 1fr;
    text-align: center;
  }

  nav {
    order: 3;
    flex-wrap: wrap;
    justify-content: center;
  }

  .auth-actions {
    order: 2;
    justify-content: center;
  }
}
</style>
