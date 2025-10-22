<template>
  <section class="glass-panel auth-panel">
    <h2 class="section-title">欢迎回来</h2>
    <p class="sub">登录后即可查看属于你们的小宇宙</p>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label>
        用户名
        <input v-model="username" type="text" required autocomplete="username" />
      </label>
      <label>
        密码
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <button type="submit" :disabled="auth.loading">{{ auth.loading ? '登录中...' : '登录' }}</button>
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
    </form>
    <p class="switch">
      还没有账户？
      <RouterLink to="/register">立即注册</RouterLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useHeartbeatStore } from '@/stores/heartbeat';

const auth = useAuthStore();
const heartbeat = useHeartbeatStore();
const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');

const handleSubmit = async () => {
  if (!username.value || !password.value) return;
  try {
    await auth.login(username.value, password.value);
    const redirect = (route.query.redirect as string) || '/';
    router.replace(redirect);
    heartbeat.fetchAll().catch((error) => {
      console.error('Failed to prefetch data after login', error);
    });
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped>
.auth-panel {
  max-width: 420px;
  margin: 4rem auto;
  text-align: center;
  backdrop-filter: blur(28px) saturate(150%);
}

.sub {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  margin-top: 2.2rem;
}

.auth-form label {
  text-align: left;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  color: var(--text-primary);
}

.auth-form input {
  border-radius: 16px;
  border: 1px solid var(--input-border);
  padding: 0.85rem 1.1rem;
  background: var(--input-background);
  color: inherit;
  box-shadow: var(--input-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-form input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.auth-form button[type='submit'] {
  margin-top: 0.5rem;
  background: var(--primary-button-bg);
  color: var(--primary-button-text);
  box-shadow: var(--primary-button-shadow);
}

.auth-form button[type='submit']:hover:not(:disabled) {
  background: var(--primary-button-bg-hover);
}

.error {
  color: var(--form-error);
  margin: 0;
}

.switch {
  margin-top: 1.75rem;
  color: var(--text-secondary);
}

.switch a {
  color: var(--link);
  font-weight: 600;
}
</style>
