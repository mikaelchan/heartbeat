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
  padding: 1.4rem 2.4rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
}

.brand-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.brand-block h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.greeting {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

nav {
  display: flex;
  justify-content: center;
  background: rgba(15, 23, 42, 0.06);
  padding: 0.35rem;
  border-radius: 999px;
  position: relative;
  gap: 0.25rem;
}

nav::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
  pointer-events: none;
}

nav a {
  position: relative;
  padding: 0.45rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.2s ease, transform 0.2s ease;
  z-index: 0;
}

nav a.router-link-active {
  color: #0f172a;
}

nav a.router-link-active::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #ffffff;
  box-shadow: 0 12px 20px rgba(59, 130, 246, 0.18);
  z-index: -1;
}

nav a:active {
  transform: scale(0.97);
}

.auth-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.auth-actions a,
.auth-actions button {
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
  transition: background 0.2s ease, transform 0.2s ease;
}

.auth-actions a:hover,
.auth-actions button:hover {
  background: rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.auth-actions .primary {
  background: #007aff;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(0, 122, 255, 0.22);
}

.auth-actions .primary:hover {
  background: #0066d6;
}

@media (max-width: 900px) {
  .app-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.25rem;
  }

  nav {
    margin: 0 auto;
    flex-wrap: wrap;
  }

  .auth-actions {
    justify-content: center;
  }
}
</style>
