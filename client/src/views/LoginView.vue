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
    await heartbeat.fetchAll();
    const redirect = (route.query.redirect as string) || '/';
    router.replace(redirect);
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
  color: #0f172a;
}

.auth-form input {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.85rem 1.1rem;
  background: rgba(255, 255, 255, 0.95);
  color: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-form input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.auth-form button[type='submit'] {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #007aff 0%, #5f5cff 100%);
  color: #ffffff;
  box-shadow: 0 18px 32px rgba(0, 122, 255, 0.24);
}

.auth-form button[type='submit']:hover:not(:disabled) {
  background: linear-gradient(135deg, #0066d6 0%, #4f46e5 100%);
}

.error {
  color: #ff5d5d;
  margin: 0;
}

.switch {
  margin-top: 1.75rem;
  color: var(--text-secondary);
}

.switch a {
  color: #007aff;
  font-weight: 600;
}
</style>
